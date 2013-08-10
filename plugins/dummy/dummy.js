var PluginManager = require('PluginManager'),
	util = require('util');

function dummy(config) {
	PluginManager.call(this, __dirname+'/dummy', [], config);
}

util.inherits(dummy, PluginManager);

module.exports = dummy;
