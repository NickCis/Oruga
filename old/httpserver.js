var http = require('http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),
	crypto = require('crypto'); //For session keys

/* OrugaServer - Create a new instance of OrugaServer, must be run with new!
 * @params configDict - Config Dictionary:
 *	{
 *		rootPath: (string) string of the path to the root of the http (file) server
 *		checkLogin: (function) function (user, pass, cb(err, data) ) - function that checks if the convination of user password is valid. user is the Username, pass the password of the username, and cb is the callback that has to be called when finishing the check. To the callback to arguments must be passed, err (error, eg. bad login), and data (the data to be stored in the session)
 *		queryDb: (object) an object with 3 keys: (function) song, (function) album, (function) artist. To these functions 2 arguments are passed, (object) data (a dict with the information to do the WHERE clause) and cb(err, data), the callback (data, is a list of dicts with all de the song/album/artist information)
 *		player: (object) object to control de player. All player methods are called in this way function(params, cb(err, data)) params are a list with all the parameters, cb is a callback function, err, error (null / undefined if no error), data, is the data to be printed
 *	}
 * @return A OrugaServer instance
 * The keys of configDict are optional, but the default values of all the functions are dummy functions. Only checkLogin, queryDb and player must be setted! (rootPath havenot to be setted)
 *
 * */
var OrugaServer = function(configDict) {
	configDict = configDict || {};
	this.sessions = {};
	this.rootPath = configDict.rootPath || './ui';
	this.checkLogin = configDict.configLogin || function(u,p, cb) {console.warn('checkLogin undefined'); cb(undefined, {});};
	//queryDb must be an object with 3 functions: song(data, cb), artist(data, cb), album(data, cb). The data argument is a dict with the information to do the WHERE clause in the database query.

	this.queryDb = configDict.queryDb || {
		'song': function(data, cb) {console.warn('queryDb.song undefined'); cb(undefined, {});},
		'album': function(data, cb) {console.warn('queryDb.album undefined'); cb(undefined, {});},
		'artist': function(data, cb) {console.warn('queryDb.artist undefined'); cb(undefined, {});}
	};
	this.player = configDict.player || {};

};

OrugaServer.prototype.contentTypeMap = {
	txt: 'text/plain',
	js: 'text/javascript',
	css: 'text/css',
	html: 'text/html',
	xml: 'application/xml',
	jpg: 'image/jpeg',
	png: 'image/png',
	tiff: 'image/tiff',
	gif: 'image/gif'
};

OrugaServer.prototype.playerMethods = [
//	Method  // http call
	'play', // /play
	'stop', // /stop
	'pause', // /pause
	'next', // /next
	'prev', // /prev
	'add', // /add/SONGID/PLAYLISTID SONGID -> | PLAYLISTID is optional -> add song to specified playlist or current
	'volume', // /volume/VALUE -> sets volume
	'info', // /info -> gets basic info of player
	'playlist', // /playlist -> get current playlist
	'shuffle', // /shuffle/FLAG FLAG 0: false 1: true FLAG is optional, will toogle.
	'loop', // /loop/FLAG FLAG 0: false 1: true FLAG is optional, will toogle.
	'goto' // /goto/TIME TIME: time in seconds
];

OrugaServer.prototype.queryMethods = [
	'artist',
	'album',
	'song',
	'playlist'
];

/* start - Starts the http server
 * Connection can be done:
 *		/login/[user]/[pasword] -> returns sessionKey if connection ok, false if not. (Also creates cookies)
 *		/credentials/[user]/[password]/action/...  executes the action or returns false if connection error
 *		/session/[session key]/action/... executes action if session key is valid
 * @params port : the desire port for the server
 * @params ip
 * */
OrugaServer.prototype.start = function(port, ip) {
	var that = this,
		ip = (ip) ? ip : '127.0.0.1',
		port = (port) ? port : '1337';
	http.createServer(function (req, res) {
		var params = req.url.split('/'),
			write = function(code, body, headers) { that.write(res, code, body, headers);} ;
			userInfo = {},
			cookies = that.parseCookies(req);
		params.shift(); //Take out / of params

		if (['', 'index.html', 'css', 'js', 'images', 'navigation'].indexOf(params[0].toLowerCase()) != -1) { //All data needed for showing
			that.pageCall(params, req, res, {});
			return;
		} else if (params[0].toLowerCase() == 'login' || params[0].toLowerCase() == 'credentials') {
			//TODO: Make sth in order to prevent bruteforce
			var paramFirst = params.shift(),
				user = params.shift(),
				pass = params.shift();
			that.checkLogin(user, pass, function(err, data) {
				if (err)
					write(200, 'false');
				else {
					//Credentials ok!
					var sessionKey = that.addSession.call(that, user, pass, data);
					switch(paramFirst) {
						case 'login':
							write(200, sessionKey, {
								'Content-Type': that.contentTypeMap.txt,
								'Set-Cookie': 'session='+sessionKey+'; Path=/;'
							});
							break;

						case 'credentials':
							var thisSession = that.getSession(sessionKey);
							if (thisSession)
								that.serverAction(params, req, res, thisSession);
							break;
					}
				}
			});
			return;
		} else if (params[0].toLowerCase() == 'session'){
			params.shift();
			cookies['session'] = params.shift();
		}

		var thisSession = that.getSession(cookies['session']);
		if (thisSession) {
			that.serverAction(params, req, res, thisSession);
			return;
		}
		write(400, 'not connected');
	//Not connected!
	}).listen(port, ip);
	console.log("Server running at http://%s:%d/", ip, port);
};

/* serverAction - Action of server, process api call o file server
 * @params params - url data
 * @params req - request object
 * @params res - response object
 * @params userInfo - userInfo dict, (the one stored in the session)
 * */
OrugaServer.prototype.serverAction = function(params, req, res, userInfo) {
	if (params[0].toLowerCase() == 'api')
		this.apiCall(params, req, res, userInfo);
	else
		this.pageCall(params, req, res, userInfo);
};

/* apiCall - Do an api call
 * @params params - url data
 * @params req - request object
 * @params res - response object
 * @params userInfo - userInfo dict (the one stored in the session)
 * */
OrugaServer.prototype.apiCall = function(params, req, res, userInfo) {
	var that = this,
		write = function(code, body, headers) { that.write.call(that, res, code, body, headers);} ;
	if (!params.length >= 3)  //We need at least params[2]
		return;

	params[2] = params[2].toLowerCase();

	switch (params[1].toLowerCase() ) {
		case 'player':
			if (this.playerMethods.indexOf(params[2]) ) {
				if (! typeof(this.player[params[2]]) == 'function') {
					console.warn('OrugaServer :: object player has not method \'%s\'', params[2]);
					return;
				}
				this.player[params[2]](params[2].slice(3), function(err, rtaData) {
					if (err) {
						console.warn('OrugaServer :: error while running player method \'%s\': \n %s', params[2], err);
						return;
					}
					write(200, rtaData);
				});
			}
			console.log('player');
			break;
		case 'query':
			var queryData = (params.length >= 4) ? JSON.parse(decodeURIComponent(params[3])) : {};
			console.log('query');
			if (this.queryMethods.indexOf(params[2]) != -1) {
				if (! typeof(this.queryDb[params[2]]) == 'function') {
					console.warn('OrugaServer :: object queryDb has not method \'%s\'', params[2]);
					return;
				}
				this.queryDb[params[2]](queryData, function(err, rtaData){
					if (err) {
						console.warn('OrugaServer :: error while running queryDb method \'%s\': \n %s', params[2], err);
						return;
					}
					write(200, rtaData);
				});
			}
			break;

		default:
			//invalid.
			break;
	}
};

/* pageCall - Do an page call, file server
 * @params params - url data
 * @params req - request object
 * @params res - response object
 * @params userInfo - userInfo dict (the one stored in the session)
 * */
OrugaServer.prototype.pageCall = function (params, req, res, userInfo) {
	var that = this,
		write = function(code, body, headers) { that.write(res, code, body, headers);} ;
	try {
		var pathname = url.parse(req.url).pathname.substring(1);
		if (pathname == '') pathname = 'index.html';
		pathname = path.join(this.rootPath, pathname);

		if (pathname.indexOf('..') != -1) {
			write(404, "cannot ask for files with .. in the name\n");
			return;
		}

		path.exists(pathname, function(exists) {
			if (!exists) {
				write(404, "cannot find that file\n");
				return;
			}

			fs.stat(pathname, function(err, stats) {
				if (err) {
					write(400, "unable to read file information: "+err+"\n");
					return;
				}

				fs.readFile(pathname, function(err, data) {
					if (err) {
						write(400, "unable to read file: "+err+"\n");
						return;
					}
					write(200, data, {'Content-Type': that.contentTypeMap[path.extname(pathname).substring(1).toLowerCase()]});
				});
			});
		});
	} catch (e) {
		write(500, e.toString());
	}
};

/* write - Write header, response and end the connection
 * @params res - response object
 * @params code - Http code
 * @params body - data send
 * @params headers - A header dict
 * */
OrugaServer.prototype.write = function (res, code, body, headers) {
	if (!headers) headers = {};
	if (!headers['Content-Type']) headers['Content-Type'] = this.contentTypeMap.txt;

	res.writeHead(code, headers);
	res.end(body);
};

/* parseCookies - parsee the cookies of the current request
 * @params req - request object
 * @return dict of the cookies
 * */
OrugaServer.prototype.parseCookies = function (req) {
	var cookies = {};
	req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
		var parts = cookie.split('=');
		if (! cookies[ parts[0]]) //FIXME
			cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
	});
	return cookies;
}

/* addSession - creates a session for a user
 * @params user - username
 * @params pass - user password
 * @params data - data to be stored in the session
 * */
OrugaServer.prototype.addSession = function (user, pass, data) {
	var md5 = crypto.createHash('md5'), sha = crypto.createHash('sha1');
	md5.update(user+Math.random()+pass+Math.random());
	sha.update(md5.digest('hex'));
	data = data || {};
	data.timeout = data.timeout || 3600;
	data.Expires = data.timeout + new Date().getTime()/1000;
	var sessionKey = sha.digest('hex');
	this.sessions[sessionKey] = data;
	console.log('sesionkey ', sessionKey);
	return sessionKey;
};

/* getSession - get session stored data
 * @params sessionKey - a sessionKey
 * @return the data stored in the session or null
 * */
OrugaServer.prototype.getSession = function (sessionKey) {
	if (! this.sessions[sessionKey])
		return null;
	var thisSession = this.sessions[sessionKey],
		thisDate = new Date().getTime()/1000;
	if (thisSession.Expires < thisDate) {
		delete this.sessions[sessionKey];
		return null;
	}
	thisSession.Expires = thisSession.timeout + thisDate;
	return thisSession;
};

/* sessionCleaner - checks for timeouts
 * */
OrugaServer.prototype.sessionCleaner = function () {
	var thisDate = new Date().getTime()/1000,
		newSessions = [];
	this.sessions.forEach(function(value, key) {
		if (value.Expires > thisDate)
			newSessions.push(value);
	});
	this.sessions = newSessions;
}

exports.OrugaServer = OrugaServer;

//Testing
//var OS = new OrugaServer();
//OS.start();
