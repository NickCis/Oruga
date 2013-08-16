var PluginManager = require('oruga_server').PluginManager,
	util = require('util');

function dbhandle(args, config) {
	var defArgs = [
		'-o0',
		'-i0',
		'-e0',
		__dirname+'/dbhandled'
	],
		defConfig = {
			cwd: __dirname
		};

	//PluginManager.call(this, __dirname+'/dummy', newArgs, newConfig);
	PluginManager.call(this, "stdbuf" , this.extendArgs(defArgs, args), this.extendConfig(defConfig, config));
}

util.inherits(dbhandle, PluginManager);

module.exports = dbhandle;
