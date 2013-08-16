var PluginManager = require('oruga_server').PluginManager,
	util = require('util');

function dummy(args, config) {
	var defArgs = [
		'-o0',
		'-i0',
		'-e0',
		__dirname+'/dummy'
	],
		defConfig = {
			cwd: "/usr/bin"
		};

	//PluginManager.call(this, __dirname+'/dummy', newArgs, newConfig);
	PluginManager.call(this, "stdbuf" , this.extendArgs(defArgs, args), this.extendConfig(defConfig, config));
}

util.inherits(dummy, PluginManager);

module.exports = dummy;
