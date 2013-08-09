var PluginManager = require('PluginManager');
function DbHandle(config) {
	PluginManager.call(this, [], config);
}


util.inherits(DbHandle, PluginManager);
module.exports = DbHandle;
