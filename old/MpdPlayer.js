var mpdSocket = require('mpdsocket');

var MpdPlayer = function(config) {
	this.config = config || {};
	this.mpd = null;
	this.mpdReady = false;
	this.mpdDoList = [];
};


MpdPlayer.prototype.connect = function(config) {
	config = config || {};
	this.port = config.port || 6600;
	this.ip = config.ip || '127.0.0.1';
	this.mpd = new mpdSocket(this.ip, this.port);
	if (typeof(config['cb']) != 'function')
		config['cb'] = function() {};
	var that = this;
	this.mpd.on('connect', function() {
		that.mpdReady = true;
		that.__doActionList(config['cb']);
//		config['cb'](null, that.mpd);
	});
};
//REFERENCE: http://mpd.wikia.com/wiki/MusicPlayerDaemonCommands
MpdPlayer.prototype.__singleVarActions = {
	'play': 'play',
	'stop': 'stop',
	'pause': 'pause',
	'next': 'next',
	'prev': 'previous',
	'playlist': 'playlistinfo',
	'songinfo': 'currentsong',
	'info': 'status',
	'shuffle': 'random',
	'loop': 'repeat'
};
MpdPlayer.prototype.__2VarActions = {
	'add': 'add {var}',
	'volume': 'setvol {var}',
	'goto': 'defined in 3 var',
	'play': 'playid {var}'
};
MpdPlayer.prototype.__3VarActions = {
	'goto': 'seek {var1} {var2}'
}

MpdPlayer.prototype.__doActionList = function(cb) {
	var that = this;
	if (this.mpdDoList.length > 0) {
		this.mpd.send(that.mpdDoList[0][0], function () {
			if (typeof(that.mpdDoList[0][1]) == 'function')
				that.mpdDoList[0][1].apply(that, arguments);
			that.mpdDoList.shift();
			that.__doActionList(cb);
		});
	} else if (typeof(cb) == 'function') {
		console.log('== action list end');
		cb(null, that.mpd);
	}
};


MpdPlayer.prototype.__do = function(cmd, cb) {
	if (this.mpdReady)
		this.mpd.send(cmd, cb);
	else
		this.mpdDoList.push([cmd,cb]);
};

MpdPlayer.prototype.action = function(args, cb) {
	console.log('action');
	if (! (args instanceof Array))
		args = [args];
	if (args.length == 1 ) {
		if (this.__singleVarActions[args[0]])
			this.__do(this.__singleVarActions[args[0]], cb);
	} else if (args.length == 2) {
		if (this.__2VarActions[args[0]]) {
			if (args[0] == 'goto') {
				var that = this;
				this.__do(this.__singleVarActions['info'], function(r) {
					that.action(['goto', r['song'], args[1] ], cb);
				});
			} else
				this.__do(this.__2VarActions[args[0]].replace('{var}', args[1]), cb);
		}
	} else if (args.length == 3) {
		if (this.__3VarActions[args[0]])
			this.__do(this.__3VarActions[args[0]].replace('{var1}', args[1]).replace('{var2}', args[2]), cb);
	}
};

exports.MpdPlayer = MpdPlayer;

/*//Testing
var play = new MpdPlayer();
play.connect({
	'cb': function() {
		console.log('conectado =D');
		play.mpd.send('status', function(r) { console.log('pepe'); console.log(r);});

	}
});
play.action(['volume', 50], function(r) {console.log(' ========= im cd innn *******'); console.log(r);});*/
