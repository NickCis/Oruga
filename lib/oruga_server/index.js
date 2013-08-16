var path = require('path');
var exportArray = [
	"OrugaServer",
	"Pluginify",
	"PluginManager"
];

for(var i=0, e; e = exportArray[i]; i++)
	module.exports[e] = require(path.join(__dirname, "lib", e));
