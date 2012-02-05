var fs = require('fs'),
	path = require('path'),
	//musicmetadata = require('musicmetadata'),
	TagNode = require('tagnode'),
	mime = require('mime-magic');
/* DatabaseUpdater - create a database updater object
 * @params config - dictionary with configuration
 *		{ dbFunc: [function] a function that will add the song to the db, function(data), an argument 'data' is passed to the funcition. Data the following dict:
 *			{
 *				tag: has tag info,
 *				title: song tilte,
 *				path: path of the song,
 *				artist: song artist,
 *				album: song album,
 *				year: album year,
 *				comment: song commnent,
 *				track: song track,
 *				genre: song genre,
 *				audioProperties: has audio properties,
 *				bitrate: song bitrate,
 *				sample_rate: song sample rate,
 *				channels: song channles,
 *				length: song length (in secconds)
 *			},
 *			directory: (string or array) paths of the music directory,
 *			cbUpdate: callback which will be called when the update is finished.
 *		}
 *	@return a Database Updater object
 * */
var DatabaseUpdater = function(config) {
	this.dbFunc = config.dbFunc || function(data, cb) {cb();};
	this.directory = (( config.directory instanceof Array ) ? config.directory : [config.directory]) || null;
	this.cbUpdate = config.cbUpdate  || function() {};
};

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

/* parseDirectory - Analice a directory recursively.
 * @params pathD - Path of the directory
 * @params list - a list of the files of the directory
 * @params cb - callback
 * */
DatabaseUpdater.prototype.parseDirectory = function (pathD, list, cb) {
	var that = this,
		parseDirectory = function() { that.parseDirectory.apply(that, arguments);},
		requiredData = this._constants['requiredData'],
		allData = this._constants['allData'],
		allowedMimes = this._constants['allowedMimes'],
		addSong = this.dbFunc;

	//console.log(arguments);
	if (list == undefined || list.length == 0) {
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
				console.log(thispath);
				//TODO: check error
				//console.log('Mime %s',type);
				if ( allowedMimes.indexOf(type) != -1) {
					//var stream = fs.createReadStream(thispath),
					//	parser = new musicmetadata(stream);
					var tn = new TagNode.TagNode(thispath);
					//parser.on('metadata', function(thismeta) {
					tn.read(function(err, thismeta) {
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
					/*parser.on('done', function(err) {
						if (err) {
							//throw err;
							console.log(thispath, type, err);
						} //else //FIXME: Ver cuando hay qe cerrar stream
							//stream.destroy();
					});*/
				} else {
					//console.log('Mime not allowed: %s', type);
					//console.log('continue...');
					parseDirectory(pathD, list, cb);
				}
			});
		}
	})
};

/* startUpdate - Starts with the update
 * @params cbUpdate - callback
 * */
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

	// Making visible for require
exports.DatabaseUpdater = DatabaseUpdater;



(function() {
	//Testing purposes
	var asd = [],
		tmpTime = 0;
	setInterval(function() {console.log("Elapsed %d", tmpTime++);}, 1000);
	var dUp = new DatabaseUpdater({
		'directory': '/home/nickcis/Music',
		'dbFunc': function (data, cb) {console.log(data); asd.push(data); cb();},
		'cbUpdate': function() {
			//console.log(asd);
			for (var i=0; i<asd.length;i++) {
				data = asd[i];
				console.log("Artist: %s Album: %s Title: %s", data.artist, data.album, data.title);
			}
			console.log('Elapsed %d - Number of tracks %s - Average(track/time) %d', tmpTime, asd.length, asd.length/tmpTime);
			process.exit();
		}
	});
	dUp.startUpdate();
})();

