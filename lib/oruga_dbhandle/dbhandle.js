var PluginManager = require('oruga_server').PluginManager,
	util = require('util');

function dbhandle(config) {
	//PluginManager.call(this, __dirname+'/dbhandled', [], config);
	PluginManager.call(this, "stdbuf" , ['-o0', '-i0', '-e0', __dirname+'/dbhandled'], config);
}
util.inherits(dbhandle, PluginManager);


module.exports = dbhandle;
