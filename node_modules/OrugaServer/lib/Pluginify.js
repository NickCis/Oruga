var fs = require('fs'),
	path = require('path');

function Pluginify(plugins, config){
	this.p = plugins || [];
	(this.p instanceof Array) || (this.p = [this.p]);
	this.c = config || {};
	this.plugins = {};
}

Pluginify.prototype.selectPlugin = function(name){
	return true;
};

Pluginify.prototype.loadAll = function(){
	for(var i=0, p; p = this.p[i]; i++){
		var name, path, m;
		if(p instanceof Array){
			name = p[0] || p;
			path = p[1] || p;
		}else{
			name = p.name || p;
			path = p.path || p;
		}
		if(m = path.match(/(.*?)\*\/?/))
			this.loadFolder(m[1])
		else
			this.load(name, path);
	}
};

Pluginify.prototype.loadFolder = function(folder){
	fs.readdir(folder, this._readdir(folder));
};

Pluginify.prototype._readdir = function(folder){
	return (function(err, files){
		if(err)
			return;
		for(var i=0,file; file=files[i];i++){
			fs.stat(path.join(folder, file), this._stat(folder, file));
		}
	}).bind(this);
};

Pluginify.prototype._stat = function(folder, file){
	return (function(err, stat){
		if(err)
			return;

		if(stat.isDirectory() && this.selectPlugin(file))
			this.load(file, path.join(folder, file, file+".js"));
	}).bind(this);
};

Pluginify.prototype.load = function(name, file){
	try {
		var plugin = require(file);
		this.plugins[name] = new plugin();
		this.plugins[name].__base = plugin;
		this.plugins[name].run();
	}catch(e){
		delete this.plugins[name];
		console.log(e);
	}
};

Pluginify.prototype.sendMessage = function(name, event, data, cb){
	var plugin = this.plugins[name];
	if(plugin)
		plugin.sendMessage(event, data, cb);
	else
		cb(1, {
			error: -1,
			error_message: "No existe el plugin"
		});
};

module.exports = Pluginify;
