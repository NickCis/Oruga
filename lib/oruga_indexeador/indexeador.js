var PluginManager = require('oruga_server').PluginManager,
	util = require('util');

function indexeador(args, config) {
	var defArgs = [
		'-o0',
		'-i0',
		'-e0',
		__dirname+'/indexeador'
	],
		defConfig = {
			//cwd: "/usr/bin"
		};

	//PluginManager.call(this, __dirname+'/dummy', newArgs, newC nfig);
	PluginManager.call(this, "stdbuf" , this.extendArgs(defArgs, args), this.extendConfig(defConfig, config));
}

util.inherits(indexeador, PluginManager);

module.exports = indexeador;
