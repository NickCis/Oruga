(function(){
	function OrugaApi(config){
		$O.call(this, config);
	}
	OrugaApi.prototype = $O.f.xD($O.prototype, {
		constructor: OrugaApi,
		/* Habria que definir todos los metodos */
		/* Todas las cb(error, Json) */
		getSongs: function(args, cb){$O.f.notImplemented.call(this, "getSong");},
		getAlbums: function(args, cb){$O.f.notImplemented.call(this, "getAlbum");},
		getArtists: function(args, cb){$O.f.notImplemented.call(this, "getArtist");},
		getPlaylist: function(args, cb){$O.f.notImplemented.call(this, "getPlaylist");},
		getCurrent: function(args, cb){$O.f.notImplemented.call(this, "getCurrent");},
		play: function(args, cb){$O.f.notImplemented.call(this, "play");},
		stop: function(args, cb){$O.f.notImplemented.call(this, "stop");},
		pause: function(args, cb){$O.f.notImplemented.call(this, "pause");},
		addSongToPlaylist: function(args, cb){$O.f.notImplemented.call(this, "addSongToPlaylist");},
		shuffle: function(args, cb){$O.f.notImplemented.call(this, "shuffle");},
		loop: function(args, cb){$O.f.notImplemented.call(this, "loop");},
		gotoElapsed: function(args, cb){$O.f.notImplemented.call(this, "gotoElapsed");},
		setVolume: function(args, cb){$O.f.notImplemented.call(this, "setVolume");}
	});

	window.OrugaApi = OrugaApi;
})();

(function(){
	function OrugaApiTest(config){
		OrugaApi.call(this, config);
	}
	OrugaApiTest.prototype = $O.f.xD(OrugaApi.prototype, {
		constructor: OrugaApiTest,
		/* Habria que definir todos los metodos */
		getSongs: function(args, cb){
			console.log(args);
			var c = ({
				success: function(response) {
					var Json = JSON.parse(response);
					console.log(Json);
					cb(false, Json.response);
				},
				data :"limitCount=5"
			});
			var query = new Ajax("/plugins/dbhandle/getSongs/", c);
		},
		getAlbums: function(args, cb){
			cb(false, [{
				id: 1,
				name: "pepe album",
				pathimg: "img loca",
				year: 2010,
				artist: {
					id: 1,
					name: "papa"
				}
			},{
				id: 8,
				name: "asdjhajhvhjv",
				pathimg: "noooooo",
				year: 2012,
				artist: {
					id: 19,
					name: "artista"
				}
			},{
				id: 2,
				name: "adasddada",
				pathimg: "imgxxxxxxxxx",
				year: 1902,
				artist: {
					id: 8,
					name: "xxxxxxxxxx"
				}
			},{
				id: 2,
				name: "adasddada",
				pathimg: "imgxxxxxxxxx",
				year: 1902,
				artist: {
					id: 8,
					name: "xxxxxxxxxx"
				}
			}]);
		},
		getArtists: function(args, cb){
			cb(false, [{
				id: 100,
				name: "asdasd"
			},{
				id:101,
				name: "hola"
			},{
				id: 102,
				name: "pepeeee"
			},{
				id: 103,
				name: "aaaaaaaaaaaaaaaaaaa"
			}]);
		},
		getPlaylist: function(){},
		getCurrent: function(){},
		play: function(){},
		stop: function(){},
		pause: function(){},
		addSongToPlaylist: function(){},
		shuffle: function(){},
		loop: function(){},
		gotoElapsed: function(){},
		setVolume: function(){}
	});
	window.OrugaApiTest = OrugaApiTest;
})();
