var PluginManager = require('PluginManager'),
	util = require('util');

util.inherits(DbHandle, PluginManager);

function DbHandle(config) {
	PluginManager.call(this, '/root/sandbox/Oruga/plugins/dbhandle/dbhandled', [], config);
}


module.exports = DbHandle;
