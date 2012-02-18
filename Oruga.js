var httpserver = require('httpserver'),
	Database = require('Database'),
	DbManager = require('DbManager'),
	config = require('config').OrugaConfig;


(function() {
	console.log(' === Staring Oruga === ');
	db = DbMan.DbManager();
	db.connect(config['dbstring']);
	server = httpserver.OrugaServer();
	server.start({
		'checkLogin':,
		'queryDb': {
			'song':,
			'album':,
			'artist':
		},
		'player': {
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
		}
	});
})()

