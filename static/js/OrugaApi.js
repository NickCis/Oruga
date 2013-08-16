function OrugaApi(config){
	$O.call(this, config);
}

(function(){
	OrugaApi.prototype = $0.f.xD($O.prototype, {
		/* Habria que definir todos los metodos */
		getArtist: function(){},
		getAlbum: function(){},
		getSong: function(){},
		getPlaylist: function(){},
		getCurrent: function(){},
		play: function(){},
		stop: function(){},
		pause: function(){},
		addSongToPlayList: function(){},
		shuffle: function(){},
		loop: function(){},
		gotoElapsed: function(){},
		setVolume: function(){}
	});
})();

function OrugaApiTest(config){
	OrugaApi.call(this, config);
}

(function(){
	OrugaApiTest.prototype = $0.f.xD(OrugaApi.prototype, {
		/* Habria que definir todos los metodos */
		getArtist: function(){},
		getAlbum: function(){},
		getSong: function(){},
		getPlaylist: function(){},
		getCurrent: function(){},
		play: function(){},
		stop: function(){},
		pause: function(){},
		addSongToPlayList: function(){},
		shuffle: function(){},
		loop: function(){},
		gotoElapsed: function(){},
		setVolume: function(){}
	});
})();
