var Cogoteh = function() {
	this.player = 'test';
};

(function () {
	Cogoteh.prototype.setPlayer = function (player) {
		if (Cogoteh[player])
			this.player = player;
		else
			this.player = 'cogoteh';
	};

	Cogoteh.prototype.getArtist = function () {
		this[this.player].getArtist.apply(this, arguments); 
	};
	Cogoteh.prototype.getAlbum = function () {
		this[this.player].getAlbum.apply(this, arguments); 
	};
	Cogoteh.prototype.getSong = function () {
		this[this.player].getSong.apply(this, arguments); 
	};
	Cogoteh.prototype.getPlaylist = function () {
		this[this.player].getPlaylist.apply(this, arguments); 
	};
	Cogoteh.prototype.getCurrent = function () {
		this[this.player].getCurrent.apply(this, arguments); 
	};
	Cogoteh.prototype.play = function () {
		this[this.player].play.apply(this, arguments); 
	};
	Cogoteh.prototype.stop = function () {
		this[this.player].stop.apply(this, arguments); 
	};
	Cogoteh.prototype.pause = function () {
		this[this.player].pause.apply(this, arguments); 
	};
	Cogoteh.prototype.addSongToPlaylist = function() {
		this[this.player].addSongToPlaylist.apply(this, arguments);
	};


	Cogoteh.prototype.test = {};
	Cogoteh.prototype.test.getArtist = function(cb, artist) {
		//Formato id, artist
		cb( [
			{'id': 0, 'artist': 'Pepe', 'img': 'images/person-16.png'},
			{'id': 1, 'artist': 'Addd', 'img': 'images/person-16.png'},
			{'id': 2, 'artist': 'Jaksjd', 'img': 'images/person-16.png'},
			{'id': 3, 'artist': 'Kkkkk', 'img': 'images/person-16.png'},
			{'id': 4, 'artist': 'Another', 'img': 'images/person-16.png'}
		]);
	};
	Cogoteh.prototype.test.getAlbum = function(cb, data) {
		//Formato id, album, idartist, artist
		var albums = [
			{'id': 0, 'album': 'Caja', 'idartist':0,  'artist': 'Pepe', 'img': 'images/person-16.png' },
			{'id': 1, 'album': 'Carton', 'idartist':0,  'artist': 'Pepe', 'img': 'images/person-16.png'},
			{'id': 2, 'album': 'Perro', 'idartist':1,  'artist': 'Addd', 'img': 'images/person-16.png'},
			{'id': 3, 'album': 'Nada', 'idartist':2,  'artist': 'Jaksjd', 'img': 'images/person-16.png'},
			{'id': 4, 'album': 'poroto', 'idartist':0,  'artist': 'Pepe', 'img': 'images/person-16.png'},
			{'id': 5, 'album': 'Pimball', 'idartist':3,  'artist': 'Kkkkk', 'img': 'images/person-16.png'},
			{'id': 6, 'album': 'kakaka', 'idartist':4,  'artist': 'Another', 'img': 'images/person-16.png'},
		];
		//For testing purposes, only filter idartist
		var ret = [];
		if ( data.idartist !== undefined) {
			for (album in albums) {
				if (albums[album].idartist == data.idartist)
					ret.push(albums[album]);
			}
		} else
			ret = albums;
		cb(ret );
	};
	Cogoteh.prototype.test.getSong = function(cb, song) {
		//Formato de rta de cancion id, title, idartist, artist, idalbum, album, genre, discnum, year, tracknum, time
		cb( [
			{'id': 0, 'title':'Peron', 'idartist': 0, 'artist': 'Pepe', 'idalbum': 0, 'album': 'Caja', 'genre': '', 'dicnum': 0, 'year':2010, 'tracknum': 4, 'time': 200, 'img': 'images/person-16.png'},
			{'id': 1, 'title':'Papapa', 'idartist': 0, 'artist': 'Pepe', 'idalbum': 0, 'album': 'Caja', 'genre': '', 'dicnum': 0, 'year':2010, 'tracknum': 4, 'time': 200, 'img': 'images/person-16.png'},
			{'id': 2, 'title':'Nose', 'idartist': 2, 'artist': 'Jaksjd', 'idalbum': 3, 'album': 'Nada', 'genre': '', 'dicnum': 0, 'year':2010, 'tracknum': 4, 'time': 200, 'img': 'images/person-16.png'},
			{'id': 3, 'title':'AAAAAA', 'idartist': 0, 'artist': 'Pepe', 'idalbum': 0, 'album': 'Caja', 'genre': '', 'dicnum': 0, 'year':2010, 'tracknum': 4, 'time': 200, 'img': 'images/person-16.png'}
		]);
	};
	Cogoteh.prototype.test.addSongToPlaylist = function(data, playlistid) {
		//if playlist isnt setted, the song will be added to the current playable playlist
		if (! this.playlist)
			this.playlist = [];
		this.playlist.push(data);
	};
	Cogoteh.prototype.test.getPlaylist = function (cb, data) {
		cb(this.playlist);
	}
	/*Cogoteh.test.getCurrent
	Cogoteh.test.play()
	Cogoteh.test.stop()
	Cogoteh.test.pause()*/
})();
