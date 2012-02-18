var httpserver = require('httpserver'),
	Database = require('Database'),
	DbManager = require('DbManager'),
	config = require('config').OrugaConfig,
	MpdPlayer = require('MpdPlayer');


(function() {
	console.log(' === Staring Oruga === ');
	var db = new DbMan.DbManager();
	db.connect(config['dbstring']);
	var mpd = new MpdPlayer.MpdPlayer();
	mpd.connect(); //TODO: use config por mpd connect info
	var server = new httpserver.OrugaServer();
	server.start({
		'checkLogin': db.validateCredentials,
		'queryDb': {
			'song': db.querySong,
			'album': db.queryAlbums,
			'artist': db.queryArtist
		},
		'player': {
			'play': function(data, cb) { mpd.action('play', cb);},
			'stop': function(data, cb) { mpd.action('stop', cb);},
			'pause':,function(data, cb) { mpd.action('pause', cb);},
			'next':,function(data, cb) { mpd.action('next', cb);},
			'prev':,function(data, cb) { mpd.action('prev', cb);},
			'add': function(data, cb) {}, //TODO
			'volume':,function(data, cb) { mpd.action(['volume', data], cb);},
			'info': function(data, cb) { mpd.action('info' , cb);},
			'playlist': function(data, cb) { mpd.action('playlist', cb); },
			'shuffle':,function(data, cb) { mpd.action('shuffle', cb);},
			'loop':,function(data, cb) { mpd.action('loop', cb);},
			'goto': function(data, cb) { mpd.action(['goto', data], cb);},
		}
	});
})()

