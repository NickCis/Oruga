var pg = require('pg');

/* DbManager
 * @params config { 
	tablePrefix: (string) prefix of tables,
 * @returns a DbManager object
 * */
var DbManager = function(config) {
	var config = config || {};
	this.tablePrefix = config.tablePrefix || 'Oruga_';
	this.conn = null;
};

DbManager.prototype.connect = function(conString) {
	this.conn = new pg.Client(conString);
	this.conn.connect();
};

DbManager.prototype.disconnect = function() {
	this.conn.end();
};

DbManager.prototype.__constants = {
	'trackTable': 'tracks',
	'albumTable': 'albums',
	'artistTable': 'artists'
};

/* querySongs - Get songs & info about them
 * @params query - a dict with all the WHERE, ORDER BY, LIMIT clause
 * @params cb - cb to be called when the query is finished. 2 arguments are passed err, data. Err is the status error, null if any, data is a list with all the songs that matched the coditions. (including album & artist info)
 * */
DbManager.prototype.queryTrack = function(query, cb) {};

/* queryAlbum - Get songs & info about them
 * @params query - a dict with all the WHERE, ORDER BY, LIMIT clause
 * @params cb - cb to be called when the query is finished. 2 arguments are passed err, data. Err is the status error, null if any, data is a list with all the albums that matched the coditions. (including artist info)
 * */
DbManager.prototype.queryAlbums = function(query, cb) {};

/* queryArtist - Get artist & info about them
 * @params query - a dict with all the WHERE, ORDER BY, LIMIT clause
 * @params cb - cb to be called when the query is finished. 2 arguments are passed err, data. Err is the status error, null if any, data is a list with all the artist that matched the coditions
 * */
DbManager.prototype.queryArtists = function(query, cb) {};

/* addSong - Adds a song to the database. Album & Artist addition are also managed by this function.
 * @params data - a dict with all the info about the song.
 * @params cb - callback(err)
 * */
DbManager.prototype.addTrack = function(data, cb) {
	if (!data )
		cb("data is null");
	else if (!data['name'] || !data['oid_album'] ||  !data['number'] || !data["path"])
		cb("data[name] or data[oid_album] or data[number] is null");
	else {
		this.conn.query("INSERT INTO tracks(name, number, path, oid_album) VALUES($1, $2, $3, $4) RETURNING oid", [ data['name'], data['number'] , data['path'], data['oid_album']], 
			function(err, result) { 
				if(result && result.rows[0] && result.rows[0].oid)
					cb(err, result.rows[0].oid); 
				else 
					cb("no oid return");
			}
 
		);
	}
};

/* addAlbum - Adds an album to the database. Artist addition is also managed by this function. NOTE: you shouldn't use it. Just use addSong, the DbManager will add the album if necesary.
 * @params data - a dict with all the info about the album.
 * @params cb - callback(err)
 * */
DbManager.prototype.addAlbum = function(data, cb) {
	if (!data )
		cb("data is null");
	else if (!data['name'] || !data['oid_artist'])
		cb("data[name] or data[oid_artist] is null");
	else {
		this.conn.query("INSERT INTO albums(name, year, image_path, oid_artist) VALUES($1, $2, $3, $4) RETURNING oid", [ data['name'], data['year'] || '0', data['image_path'], data['oid_artist']], 
			function(err, result) { 
				if(result && result.rows[0] && result.rows[0].oid)
					cb(err, result.rows[0].oid); 
				else 
					cb("no oid return");
			}
 
		);
	}
};

/* addArtist - Adds an artist to the database. NOTE: you shouldn't use it. Just use addSong, the DbManager will add the album if necesary.
 * @params data - a dict with all the info about the Artist. Keys
 * @params cb - callback(err, oid)
 * */
DbManager.prototype.addArtist = function(data, cb) {
	if (!data )
		cb("data is null");
	else if (!data['name'] )
		cb("data[name] is null");
	else {
		this.conn.query("INSERT INTO artists(name) VALUES($1) RETURNING oid", [data['name']], 
			function(err, result) { 
				if(result && result.rows[0] && result.rows[0].oid)
					cb(err, result.rows[0].oid); 
				else 
					cb("no oid return");
			}
 		);
	}
};
 
/* editSong - edit song information
 * @params songid - id of the song
 * @params data - a dict with all the info to be updated / edited
 * @params cb - callback(err)
 * */
DbManager.prototype.editTrack = function(oid, data, cb) {
	if (!data )
		cb("data is null");
	else if (!data['name'] || !oid )
		cb("data[name] is null");
	else
		this.conn.query("UPDATE tracks SET name=$1 WHERE oid = $2", [data['name'], oid], cb );

};

/* editAlbum - edit song information
 * @params albid - id of the album
 * @params data - a dict with all the info to be updated / edited
 * @params cb - callback(err)
 * */
DbManager.prototype.editAlbum = function(oid, data, cb) {
	if (!data )
		cb("data is null");
	else if (!data['name'] || !oid )
		cb("data[name] is null");
	else
		this.conn.query("UPDATE albums SET name=$1 WHERE oid = $2", [data['name'], oid], cb );

};

/* editArtist - edit artist information
 * @params artgid - id of the art
 * @params data - a dict with all the info to be updated / edited
 * @params cb - callback(err)
 * */
DbManager.prototype.editArtist = function(oid, data, cb) {
	if (!data )
		cb("data is null");
	else if (!data['name'] || !oid )
		cb("data[name] is null");
	else
		this.conn.query("UPDATE artists SET name=$1 WHERE oid = $2", [data['name'], oid], cb );
};

/* eraseSong - erase song. NOTE: this function DOESN'T clean the database for empty albums or artists.
 * @params songif - id of the song
 * @params cb - callback(err)
 * */
DbManager.prototype.eraseTrack = function(oid, cb) {
	if (!oid )
		cb("oid is null");
	else
		this.conn.query("DELETE FROM tracks WHERE oid = $1", [oid], cb );
};

/* eraseAlbum - erase Album. NOTE: this function DOESN'T clean the database for empty songs or artists.
 * @params albgif - id of the album
 * @params cb - callback(err)
 * */
DbManager.prototype.eraseAlbum = function(oid, cb) {
	if (!oid )
		cb("oid is null");
	else
		this.conn.query("DELETE FROM albums WHERE oid = $1", [oid], cb );
};

/* eraseArtist - erase Artist. NOTE: this function DOESN'T clean the database for empty albums or songs.
 * @params artif - id of the artist
 * @params cb - callback(err)
 * */
DbManager.prototype.eraseArtist = function(artid, cb) {
	if (!oid )
		cb("oid is null");
	else
		this.conn.query("DELETE FROM artists WHERE oid = $1", [oid], cb );
};

/* validateCredentials - Validate user pass
 * @params user - username
 * @params pass - password
 * @params cb - Callback, arguments passsed: err, response. err is the status error. response is a boolean, true if credentials are valid, false if not.
 * */
DbManager.prototype.validateCredentials = function(user, pass, cb) {};

/* addUser - Add user
 * @params param data - dict with all the necesary information to add the user
 * @params cb - callback(err)
 * */
DbManager.prototype.addUser = function(data, cb) {};

/* editUser - Edits a user
 * @params uid - User id
 * @params config - dict with the edited fields.
 * @params cb - callback(err)
 * */
DbManager.prototype.editUser = function(uid, config, cb) {};

/* eraseUser - Erase a user
 * @params uid - User id
 * @params cb - callback(err)
 * */
DbManager.prototype.eraseUser = function(uid, cb) {};

/* InitialSetup - Creates tables and all initial setup. NOTE: this function must never be ran. It should be ran only once, by the installer.
 * @params config - Configuration.
 * @params cb - callback(err)
 * */
DbManager.prototype.InitialSetup = function (config, cb) {};

/* getConfig - Gets the config options. The config options are all the user configuration things of the player. They are in a table like this
 * id | key | type | value
 * Key is the name of the configuration parameter, type is the type (which will be interpreted by this DbManager, eg.: json, number, string) and value is the value.
 * @params cb - Callback(err, configDict), err is the status error, null if evertything went Ok. configDict is the parsed dictionary of the configuration parameters, the key are the key of the config options and the values are the values already parsed.
 * */
DbManager.prototype.getConfig = function(cb) {};

/* setConfig - saves config options. If the config option allready exists, it will be overrriden.
 * @params data - Dict of config options (similiar to the returned configDict of the getConfig).
 * @params cb - Callback(err)
 * @param types - Dict of key -> value type of config dict. (If the value type of a specifig option is missing, or the parameter isn't passed, the type will be autodetected)
 * */
DbManager.prototype.setConfig = function(data, cb, types) {};

//Exporting
exports.DbManager = DbManager;


var test = new DbManager();
test.connect("tcp://admin:admin@127.0.0.1/oruga");

var artist = {
	'name': "seba capo"
};
test.addArtist( {'name': 'seba'}, function(err, result) { console.log("query ok " + err + "  " + result); } );


//test.disconnect();

