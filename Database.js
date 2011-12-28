var fs = require('fs'),
	path = require('path'),
	musicmetadata = require('musicmetadata'),
	mime = require('mime-magic');


var requiredData = [
		'artist',
		'album',
		'title'
	],
	allData = requiredData.slice(0);
allData.push(
	'year',
	'track',
	'picture'
);
var allowedMimes = [ //TODO: add all mimes
	'audio/mpeg',
//	'video/quicktime',
	'application/octet-stream'
];
var DatabaseUpdater = function() {};
function parseDirectory(pathD, list, cb) {
	console.log(arguments);
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
				console.log('Mime %s',type);
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
							console.log('We need more data');
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
						console.log(thispath, err);
						if (err) throw err;
						stream.destroy();
					});
				} else {
					console.log('Mime not allowed: %s', type);
					console.log('continue...');
					parseDirectory(pathD, list, cb);
				}
			});
		}
	})
}
var songsdata=[];
function addSong(data, cb) {
	//TODO: Add song
	console.log('------> Add song');
	console.log(data);
	if (data.title) 
		songsdata.push([data.title, data.artist, data.album]);
	cb();
}
(function() {
	//Testing purposes
	var pathstr = '/home/nickcis/Music/';
	console.log('================ start ===============');
	fs.readdir(pathstr, function(err, files) {
		console.log(files);
		parseDirectory(pathstr, files, function() {
			console.log('================ finish ===============');
			console.log(songsdata);
			console.log('%s songs were found', songsdata.length);
		});
	});
})();

