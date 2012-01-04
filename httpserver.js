var http = require('http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),
	crypto = require('crypto'); //For session keys

var OrugaServer = function(configDict) {
	configDict = configDict || {};
	this.sessions = {};
	this.rootPath = configDict.rootPath || './ui';
	this.checkLogin = configDict.configLogin || function(u,p, cb) {cb(undefined, {});};
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

OrugaServer.prototype.start = function(port, ip) {
	var that = this,
		ip = (ip) ? ip : '127.0.0.1',
		port = (port) ? port : '1337';
	http.createServer(function (req, res) {
		var params = req.url.split('/'),
			write = function(code, body, headers) { that.write(res, code, body, headers);} ;
			userInfo = {},
			cookies = that.parseCookies(req);
		params.shift();
		//TODO check if it is connected;

		if (params[0].toLowerCase() == 'login') {
			//TODO: Make sth in order to prevent bruteforce
			var user = params[1],
				pass = params[2];
			that.checkLogin(user, pass, function(err, data) {
				if (err) {
					write(200, 'false');
				} else {
					//Credentials ok!
					var sessionKey = that.addSession.call(that, user, pass, data);
					write(200, 'true', {
						'Content-Type': that.contentTypeMap.txt,
						'Set-Cookie': 'session='+sessionKey+'; Path=/;'
					});
				}
			});
			return;
		}

		if (params[0].toLowerCase() == 'session'){
			params.shift();
			cookies['session'] = params.shift();
		}
		if (params[0].toLowerCase() == 'credentials') {
			params.shift();
			var user = params.shift(),
				pass = params.shift();
			//TODO: Login by db 
			return;
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
OrugaServer.prototype.serverAction = function(params, req, res, userInfo) {
	if (params[0].toLowerCase() == 'api')
		this.apiCall(params, req, res, userInfo);
	else
		this.pageCall(params, req, res, userInfo);
};
OrugaServer.prototype.apiCall = function(params, req, res, userInfo) {
	var that = this,
		write = function(code, body, headers) { that.write.call(that, res, code, body, headers);} ;
	switch (params[1].toLowerCase() ) {
		case 'player':
			switch(params[2].toLowerCase()) { //TODO: integrate player api
				case 'play':
					break;
				case 'stop':
					break;
				case 'pause':
					break;
				case 'next':
					break;
				case 'prev':
					break;
				case 'add':
					break;
			}
			console.log('player');
			break;
		case 'query':
			console.log('query');
			break;

		default:
			//invalid.
			break;
	}
};

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

OrugaServer.prototype.write = function (res, code, body, headers) {
	if (!headers) headers = {};
	if (!headers['Content-Type']) headers['Content-Type'] = this.contentTypeMap.txt;

	res.writeHead(code, headers);
	res.end(body);
};

OrugaServer.prototype.parseCookies = function (req) {
	var cookies = {};
	req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
		var parts = cookie.split('=');
		if (! cookies[ parts[0]]) //FIXME
			cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
	});
	return cookies;
}
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

OrugaServer.prototype.sessionCleaner = function () {
	var thisDate = new Date().getTime()/1000,
		newSessions = [];
	this.sessions.forEach(function(value, key) {
		if (value.Expires > thisDate)
			newSessions.push(value);
	});
	this.sessions = newSessions;
}

//Testing
var OS = new OrugaServer();
OS.start();
