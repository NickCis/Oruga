var Oruga = function() {
	this.player = 'test';
},
	OrugaUi = function(player) {
		this.player = player;
		this.doBinds();
		this.updateData();
		this.startIntervals();
	};

(function () {
	Oruga.prototype.setPlayer = function (player) {
		if (this[player])
			this.player = player;
		else
			this.player = 'oruga';
	};

	Oruga.prototype.getArtist = function () {
		//Arguments: cb, data
		// cb:the callback where the list of dicts is passed [{'id': , 'artist':, 'img':}, ]
		// data: information passed to filter the artists, if nothing is passed, all artists are returned
		this[this.player].getArtist.apply(this, arguments); 
	};
	Oruga.prototype.getAlbum = function () {
		//Arguments: cb, data
		// cb:the callback where the list of dicts is passed [{'id': , 'album':, 'idartist':, 'artist':,'img':}, ]
		// data: information passed to filter the albums, if nothing is passed, all albums are returned
		this[this.player].getAlbum.apply(this, arguments); 
	};
	Oruga.prototype.getSong = function () {
		//Arguments: cb, data
		// cb:the callback where the list of dicts is passed [{'id': , 'title':, 'idartist':, 'artist':, 'idalbum':,'album':,'genre':,'year':,'tracknum':,'time':,'img':}, ]
		// data: information passed to filter the songs, if nothing is passed, all songs are returned
		this[this.player].getSong.apply(this, arguments); 
	};
	Oruga.prototype.getPlaylist = function () {
		//Arguments: cb, data
		// cb:the callback where the list of dicts is passed [{'id': , 'album':, 'idartist':, 'artist':,}, ]
		// data: information passed to filter the playlists, if nothing is passed, all playlists are returned
		this[this.player].getPlaylist.apply(this, arguments); 
	};
	Oruga.prototype.getCurrent = function () {
		//Returns data as a dict of Current
		// {'song': TYPESONG, 'playlist': [TYPESONG, TYPESONG, ...], 'shuffle': boolean, 'loop': boolean, 'volume': integer, 'elapsed': integer, 'playing': boolean}
		this[this.player].getCurrent.apply(this, arguments); 
	};
	Oruga.prototype.play = function () {
		this[this.player].play.apply(this, arguments); 
	};
	Oruga.prototype.stop = function () {
		this[this.player].stop.apply(this, arguments); 
	};
	Oruga.prototype.pause = function () {
		this[this.player].pause.apply(this, arguments); 
	};
	Oruga.prototype.addSongToPlaylist = function() {
		//Arguments data, playlistid
		// data: information of the songs to be added, every song that matchs will be added
		// playlistid: id of the playlist
		//if playlist isnt setted, the song will be added to the current playable playlist
		this[this.player].addSongToPlaylist.apply(this, arguments);
	};
	Oruga.prototype.shuffle = function() {
		//Arguments: bool. If bool is true, shuffle will be setted true, if false, false
	};
	Oruga.prototype.loop = function() {
		//Arguments: bool. If bool is true, loop will be setted true, if false, false
	};
	Oruga.prototype.gotoElapsed = function () {
		//Argument: number. Goto elapsed time in seconds
	};
	Oruga.prototype.setVolume = function () {
		//Argument: number. setVolume
	};


	Oruga.prototype.oruga = {};
	Oruga.prototype.oruga.query = function(arg, cb, data) {
		var cb = cb || function() {};
		var data = (typeof(data) != 'undefined') ? '/' + encodeURIComponent(data): '';
		$.get('/' + arg + data, function(datarta) {
			cb(datarta);
		});
	};

	Oruga.prototype.oruga.play = function(cb) {
		this.query('player/play', cb);
	};
	Oruga.prototype.oruga.stop = function(cb) {
		this.query('player/stop', cb);
	};
	Oruga.prototype.oruga.pause = function(cb) {
		this.query('player/pause', cb);
	};

	Oruga.prototype.oruga.getArtist = function(cb, query) {
		this.query('query/artist', cb, query);
	};
	Oruga.prototype.oruga.getAlbum = function(cb, query) {
		this.query('query/album', cb, query);
	};
	Oruga.prototype.oruga.getSong = function(cb, query) {
		this.query('query/song', cb, query);
	};
	Oruga.prototype.oruga.getPlaylist = function (cb, query) {
		this.query('query/playlist', cb, query);
	};

	Oruga.prototype.oruga.getCurrent = function (cb) {
		this.query('player/info',cb);
	};
	Oruga.prototype.oruga.setVolume = function(val, cb) {
		if (val)
			this.query('player/volume', val, cb);
	};

	Oruga.prototype.oruga.shuffle = function(cb, val) {
		this.query('player/shuffle', val, cb);
	};

	Oruga.prototype.oruga.loop = function(cb, val) {
		this.query('player/loop', val, cb);
	};

	Oruga.prototype.oruga.gotoElapsed = function(time, cb) {
		this.query('player/goto', time, cb);
	};

	Oruga.prototype.oruga.addSongToPlaylist = function(data, playlistid) {
		if (! data instaceof Array)
			data = [data];
		for (key in data)
			this.query('player/add', cb, (playlistid) ? data[key]+'/'+playlistid : data[key]);
	};



	Oruga.prototype.test = {};
	Oruga.prototype.test.getArtist = function(cb, artist) {
		cb( [
			{'id': 0, 'artist': 'Pepe', 'img': 'images/person-16.png'},
			{'id': 1, 'artist': 'Addd', 'img': 'images/person-16.png'},
			{'id': 2, 'artist': 'Jaksjd', 'img': 'images/person-16.png'},
			{'id': 3, 'artist': 'Kkkkk', 'img': 'images/person-16.png'},
			{'id': 4, 'artist': 'Another', 'img': 'images/person-16.png'}
		]);
	};
	Oruga.prototype.test.getAlbum = function(cb, data) {
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
	Oruga.prototype.test.getSong = function(cb, song) {
		cb( [
			{'id': 0, 'title':'Peron', 'idartist': 0, 'artist': 'Pepe', 'idalbum': 0, 'album': 'Caja', 'genre': '', 'dicnum': 0, 'year':2010, 'tracknum': 4, 'time': 200, 'img': 'images/person-16.png'},
			{'id': 1, 'title':'Papapa', 'idartist': 0, 'artist': 'Pepe', 'idalbum': 0, 'album': 'Caja', 'genre': '', 'dicnum': 0, 'year':2010, 'tracknum': 4, 'time': 200, 'img': 'images/person-16.png'},
			{'id': 2, 'title':'Nose', 'idartist': 2, 'artist': 'Jaksjd', 'idalbum': 3, 'album': 'Nada', 'genre': '', 'dicnum': 0, 'year':2010, 'tracknum': 4, 'time': 200, 'img': 'images/person-16.png'},
			{'id': 3, 'title':'AAAAAA', 'idartist': 0, 'artist': 'Pepe', 'idalbum': 0, 'album': 'Caja', 'genre': '', 'dicnum': 0, 'year':2010, 'tracknum': 4, 'time': 200, 'img': 'images/person-16.png'}
		]);
	};
	Oruga.prototype.test.addSongToPlaylist = function(data, playlistid) {
		if (! this.playlist)
			this.playlist = [];
		this.playlist.push(data);
	};
	Oruga.prototype.test.getPlaylist = function (cb, data) {
		cb(this.playlist);
	};
	Oruga.prototype.test.getCurrent = function (cb) {
		if (! this.playlist)
			this.playlist = [
				{'id': 0, 'title':'Peron', 'idartist': 0, 'artist': 'Pepe', 'idalbum': 0, 'album': 'Caja', 'genre': '', 'dicnum': 0, 'year':2010, 'tracknum': 4, 'time': 200, 'img': 'images/person-16.png'},
				{'id': 1, 'title':'Papapa', 'idartist': 0, 'artist': 'Pepe', 'idalbum': 0, 'album': 'Caja', 'genre': '', 'dicnum': 0, 'year':2010, 'tracknum': 4, 'time': 200, 'img': 'images/person-16.png'}
			];
		if (! this.elapsed)
			this.elapsed = 0;
		this.ret = {
			'song': {'id': 0, 'title':'Peron', 'idartist': 0, 'artist': 'Pepe', 'idalbum': 0, 'album': 'Caja', 'genre': '', 'dicnum': 0, 'year':2010, 'tracknum': 4, 'time': 200, 'img': 'images/person-16.png'},
			'playlist': this.playlist,
			'shuffle': false,
			'loop': true,
			'volume':100,
			'elapsed': this.elapsed++,
			'playing':true
		};
		cb(this.ret);
	};
	/*Oruga.test.getCurrent
	Oruga.test.play()
	Oruga.test.stop()
	Oruga.test.pause()*/

	OrugaUi.prototype._constants = {
		'playpause': '#player_play_pause',
		'previous': '#player_previous',
		'next': '#player_next',
		'elapsed': '#player_elapsed',
		'duration': '#player_duration',
		'shuffle': '#player_shuffle',
		'loop': '#player_loop',
		'volumeSlider': '#volumeSlide',
		'volume': '#player_volume',
		'seek': '#player_controls_seeking',
		'pauseClass': 'pause',
		'shuffleClass': 'active',
		'loopClass': 'active',
//		'playlistList': ['ol', '#queue_list_window'],
		'playlistList': ['#queue_list_window > div'],
		'playlistItem': 'div',
		'playlistItemClass': 'queue_item'
	};
	OrugaUi.prototype._vars = {
		'elapsed':0,
		'fakeElapsed':0,
		'strsong': '',
		'song': {'time':0},
		'playlist': [],
		'strplaylist': '',
		'volume':0,
		'playing': false,
		'loop': false,
		'shuffle': false,
		'fakeUpdateInterval': 0,
		'realUpdateInterval': 0
	};
	OrugaUi.prototype._sliderValue = function(elapsed, time) {
		return (time != 0 ? 100 * elapsed / time : 0);
	};
	OrugaUi.prototype._slider2Value = function(value, time) {
		return value * time / 100;
	};
	OrugaUi.prototype.setSeekValue = function(elapsed, time) {
		$(this._constants['seek']).slider('value', this._sliderValue(elapsed, time));
	};
	OrugaUi.prototype.setVolumeData = function(volume) {
		//TODO: do it!
	};
	OrugaUi.prototype.sec2time = function(s) {
		var hours = parseInt( s / 3600 ) % 24,
			minutes = parseInt( s / 60 ) % 60,
			seconds = s % 60;
		hours = (hours < 10 ? "0" + hours : hours);
		minutes = (minutes < 10 ? "0" + minutes : minutes);
		seconds = (seconds  < 10 ? "0" + seconds : seconds);
		return (s >= 3600 ? hours+':'+minutes+':'+seconds : minutes+':'+seconds);
	};
	OrugaUi.prototype.doBinds = function() {
		var cons = this._constants,
			player = this.player,
			that = this;
		$(cons['playpause']).click(function(ev){
			if ($(this).hasClass(cons['pauseClass']))
				player.play();
			else
				player.pause();
		});
		$(cons['previous']).click(function(ev){
				player.previous();
		});
		$(cons['next']).click(function(ev){
			player.next();
		});
		for (key in {'shuffle': 0, 'loop': 0}) {
			$(cons[key]).click(function (ev) {
				if ($(this).hasClass(cons[key+'Class']) )
					player[key](false);
				else
					player[key](true);
			});
		}
		$(cons['seek']).bind('slide', function(event, ui){
			player.gotoElapsed(that._slider2Value($(cons['seek']).slider('value'), that._var['song']['time']));
		});
		$(cons['volumeSlider']).bind('slide', function(event, ui){
			player.setVolume($(cons['volumeSlider']).slider('value'));
		});
	};
	OrugaUi.prototype.song2Playlist = function(number, songData ) {
		var html = '<'+this._constants['playlistItem']+' data-number="'+number+'" class="'+this._constants['playlistItemClass']+'">';
		html += '<a class="remove_item" title=""></a>'+ //TODO:deshardcodear class
			'<div class="albumart"><img src="'+songData.img+'"/></div>'+
			'<div class="names">'+
				'<a class="songname">'+songData.title+'</a>'+
				'<a class="artistname">'+songData.artist+'</a>'+
			'</div>'+
		'</'+this._constants['playlistItem']+'>';
		return html;
	};
	OrugaUi.prototype.Songs2Playlist = function(songsData) {
		var $playlist = $.apply(null, this._constants['playlistList']),
			html = '';
		for (key in songsData)
			html += this.song2Playlist(key, songsData[key]);
		$playlist.html(html);
		delete $playlist;
	};
	OrugaUi.prototype.updateData = function() {
		var that = this,
			cons = this._constants,
			vars = this._vars;
		this.player.getCurrent(function(data) {
			if (data.playing)
				$(cons['playpause']).addClass(cons['pauseClass']);
			else
				$(cons['playpause']).removeClass(cons['pauseClass']);
			for (key in {'shuffle': 0, 'loop': 0}) {
				if (data[key])
					$(cons[key]).addClass(cons[key+'Class']);
				else
					$(cons[key]).removeClass(cons[key+'Class']);
			}
			$(cons['elapsed']).html(that.sec2time.apply(that, [data['elapsed']]));
			that.setSeekValue.apply(that, [data['elapsed'], data['song']['time']]);
			that.setVolumeData.apply(that, [data['volume']]);
			var strsong = JSON.stringify(data['song']);
			if ( strsong != vars['strsong'] || $(that._constants['duration']).html() == '00:00') {
				vars['song'] = data['song'];
				vars['strsong'] = strsong;
				$(that._constants['duration']).html(that.sec2time.apply(that, [data['song']['time']]));
				//TODO: update current song info
			}
			var strplaylist = JSON.stringify(data['playlist']);
			if ( strplaylist != vars['strplaylist'] || $.apply(null, that._constants['playlistList']).html() == '') {
				vars['playlist'] = data['playlist'];
				vars['strplaylist'] = strplaylist;
				//TODO: update current playlist info
				that.Songs2Playlist.apply(that, [data['playlist']]);
			}
			//update cache data
			vars['elapsed'] = data['elapsed'];
			vars['fakeElapsed'] = data['elapsed'];
			vars['volume'] = data['volume'];
			vars['playing'] = data['playing'];
			vars['loop'] = data['loop'];
			vars['shuffle'] = data['shuffle'];
		});
	};
	OrugaUi.prototype.startIntervals = function(real) {
		(real) || (real = 2000) ;
		var fake = 1000,
			that = this;
		this._vars['fakeUpdteInterval'] = setInterval(function(){
			that.setSeekValue.apply(that, [that._vars['fakeElapsed']++, that._vars['song']['time']] );
			$(that._constants['elapsed']).html(that.sec2time.apply(that, [that._vars['fakeElapsed']]));
		}, fake);
		this._vars['realUpdteInterval'] = setInterval(function(){
			that.updateData.apply(that, []);
		}, real);
	};
	OrugaUi.prototype.clearIntervals = function() {
		clearInterval(that._vars['fakeUpdateInterval']);
		clearInterval(that._vars['realUpdateInterval']);
	};
})();
