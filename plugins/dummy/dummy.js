var PluginManager = require('PluginManager'),
	util = require('util');

function dummy(config) {
	//PluginManager.call(this, __dirname+'/dummy', [], config);
	PluginManager.call(this, "stdbuf" , ['-o0', '-i0', '-e0', __dirname+'/dummy'], config);
}

util.inherits(dummy, PluginManager);

module.exports = dummy;
