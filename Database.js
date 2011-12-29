var fs = require('fs'),
	path = require('path'),
	musicmetadata = require('musicmetadata'),
	mime = require('mime-magic');

var DatabaseUpdater = function(config) {
	this.dbFunc = config.dbFunc || function(data, cb) {cb();};
	this.directory = (( config.directory instanceof Array ) ? config.directory : [config.directory]) || null;
	this.cbUpdate = config.cbUpdate  || function() {};
};
(function() {
	DatabaseUpdater.prototype._constants = {};
	DatabaseUpdater.prototype._constants.requiredData = [
		'artist',
		'album',
		'title'
	];
	DatabaseUpdater.prototype._constants.allData = DatabaseUpdater.prototype._constants.requiredData.slice(0);
	DatabaseUpdater.prototype._constants.allData.push(
		'year',
		'track',
		'picture'
	);
	DatabaseUpdater.prototype._constants.allowedMimes = [ //TODO: add all mimes
		'audio/mpeg',
		//	'video/quicktime',
		'application/octet-stream'
	];
	DatabaseUpdater.prototype.parseDirectory = function (pathD, list, cb) {
		var that = this,
			parseDirectory = function() { that.parseDirectory.apply(that, arguments);},
			requiredData = this._constants['requiredData'],
			allData = this._constants['allData'],
			allowedMimes = this._constants['allowedMimes'],
			addSong = this.dbFunc;

		//console.log(arguments);
		if (list == undefined) {
			cb();
			return;
		}
		if (list.length == 0) {
			cb();
			return;
		}
		var thispath = path.join(pathD, list.pop());
		fs.stat(thispath, function(err, stat){
			if (stat.isDirectory()) {
				fs.readdir(thispath, function(err, files) {
					parseDirectory(thispath, files, function() {
						parseDirectory(pathD, list, cb);
					});
				});
			} else if (stat.isFile()) {
				//Read data
				//Add to database
				mime.fileWrapper(thispath, function(err, type){ 
					//TODO: check error
					//console.log('Mime %s',type);
					if ( allowedMimes.indexOf(type) != -1) {
						var stream = fs.createReadStream(thispath),
							parser = new musicmetadata(stream);
						parser.on('metadata', function(thismeta) {
							var dataFalt = [];
							for (var key=0, value=allData[key]; key < allData.length; value=allData[++key]) {
								switch(value) { //TODO: correct check methods
									default:
										if (! thismeta[value])
											dataFalt.push(value);
										break;
								}
							}
							if (dataFalt.length > 0) {
								//TODO: Try to deduce data by path, filename, web?
								//console.log('We need more data');
								addSong(thismeta, function() {// This will be a cb of a function that get the rest of the meta
									parseDirectory(pathD, list, cb);
								});
							}else {
								addSong(thismeta, function() {
									parseDirectory(pathD, list, cb);
								});
							}
						});
						parser.on('done', function(err) {
							//console.log(thispath, err);
							if (err) throw err;
							stream.destroy();
						});
					} else {
						//console.log('Mime not allowed: %s', type);
						//console.log('continue...');
						parseDirectory(pathD, list, cb);
					}
				});
			}
		})
	};

	DatabaseUpdater.prototype.startUpdate = function(cbUpdate) {
		if (cbUpdate)
			this.cbUpdate = cbUpdate;
		this.update(this.directory);
	};
	DatabaseUpdater.prototype.update = function(list) {
		if (list.length < 1) {
			this.cbUpdate();
			return;
		}
		var that = this,
			pathstr = list.pop();
		fs.readdir(pathstr, function(err, files) {
			that.parseDirectory.call(that, pathstr, files, function() {
				that.update(list);
			});
		});
	};










	//Testing purposes
	var asd = [];
	var dUp = new DatabaseUpdater({
		'directory': '/home/nickcis/Music/',
		'dbFunc': function (data, cb) {asd.push(data); cb();},
		'cbUpdate': function() {
			//console.log(asd);
			for (var i=0; i<asd.length;i++) {
				data = asd[i];
				console.log("Artist: %s Album: %s Title: %s", data.artist, data.album, data.title);
			}
			console.log('Number of tracks %s', asd.length);
		}
	});
	dUp.startUpdate();
})();

