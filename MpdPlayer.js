var mpdScoket = require('mpdsocket');

var MpdPlayer = function(config) {
	this.config = config || {};
	this.mpd = null;
	this.mpdReady = false;
};


MpdPlayer.prototype.connect = function(config) {
	config = config || {};
	this.port = config.port || 6600;
	this.ip = config.ip || '127.0.0.1';
	this.mpd = new mpdSocket(this.ip, this.port);
	this.mpdDoList = [];
	if (typeof(config['cb']) != 'function')
		config['cb'] = function() {};
	var that = this;
	this.mpd.on('connect', function() {
		that.mpdReady = true;
		config['cb'](null, that.mpd);
		that.__doActionList.call(that);
	});
};

MpdPlayer.prototype.__doActionList = function() {
	var that = this;
	if (this.mpdDoList.length > 0) {
		var thisAct = this.mpdDoList.shift();
		this.mpd.send(thisAct[0], function () {
			if (typeof(thisAct[1]) == 'function')
				thisAct[1]();
			thisAct = null;
			that.__doActionList.call(that);
		});
	}
};

MpdPlayer.prototype.__singleVarActions = {
	'play': 'pause 1',
	'stop': 'stop',
	'pause': 'pause 0',
	'next': 'next',
	'prev': 'previous',
	'playlist': 'playlistinfo',
	'info': 'currentsong',
	'shuffle': 'random',
	'loop': 'repeat'
};
MpdPlayer.prototype.__2VarActions = {
	'add': 'add {var}',
	'volume': 'setvol {var}',
	'goto': 'seekcur {var}',
	'play': 'playid {var}'
};


/*
			'play':,
			'stop':,
			'pause':,
			'next':,
			'prev':,
			'add':,
			'volume':,
			'info':,
			'playlist':,
			'shuffle':,
			'loop':,
			'goto':
			*/

MpdPlayer.prototype.__do = function(cmd, cb) {
	if (this.mpdReady)
		this.mpd.send(cmd, cb);
	else
		this.mdpDoList.push([cmd,cb]);
};

MpdPlayer.prototype.action = function(args, cb) {
	if (! args instanceof Array)
		args = [args];
	if (args.length == 1 ) {
		if (this.__singleVarActions[arg[0]])
			this.__do(this.__singleVarActions(arg[0], cb);
	} else if (args.length == 2) {
		if (this.__2VarActions[args[0]])
			this.__do(this.__2VarActions(args[0].replace('{var}', args[1]), cb);
	}
};

exports.MpdPlayer = MpdPlayer;

//Testing
var play = new MpdPlayer();
play.connect();
play.action('pause');
