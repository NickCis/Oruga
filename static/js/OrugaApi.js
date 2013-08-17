(function(){
	function OrugaApi(config){
		$O.call(this, config);
	}
	OrugaApi.prototype = $O.f.xD($O.prototype, {
		constructor: OrugaApi,
		/* Habria que definir todos los metodos */
		getArtist: function(){$O.f.notImplemented.call(this, "getArtist");},
		getAlbum: function(){$O.f.notImplemented.call(this, "getAlbum");},
		getSong: function(){$O.f.notImplemented.call(this, "getSong");},
		getPlaylist: function(){$O.f.notImplemented.call(this, "getPlaylist");},
		getCurrent: function(){$O.f.notImplemented.call(this, "getCurrent");},
		play: function(){$O.f.notImplemented.call(this, "play");},
		stop: function(){$O.f.notImplemented.call(this, "stop");},
		pause: function(){$O.f.notImplemented.call(this, "pause");},
		addSongToPlaylist: function(){$O.f.notImplemented.call(this, "addSongToPlaylist");},
		shuffle: function(){$O.f.notImplemented.call(this, "shuffle");},
		loop: function(){$O.f.notImplemented.call(this, "loop");},
		gotoElapsed: function(){$O.f.notImplemented.call(this, "gotoElapsed");},
		setVolume: function(){$O.f.notImplemented.call(this, "setVolume");}
	});
})();

function OrugaApiTest(config){
	OrugaApi.call(this, config);
}

(function(){
	OrugaApiTest.prototype = $O.f.xD(OrugaApi.prototype, {
		constructor: OrugaApiTest,
		/* Habria que definir todos los metodos */
		getArtist: function(){},
		getAlbum: function(){},
		getSong: function(){},
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
})();
