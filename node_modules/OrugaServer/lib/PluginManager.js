var ChildProcess = require('child_process'),
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	QueryString = require('querystring');

function PluginManager(bin, args, config){
	if(arguments.length == 2){
		config = args;
		args = undefined;
	}
	this.bin = bin;
	this.args = args || [];
	this.c = config || {};
	(typeof(this.c.revivir) == 'undefined') && (this.c.revivir = true);
	this.count = 0;
	this.cbs = {};

	if(this.c.revivir){
		var revivir = 0;
		this.on('close', (function(code){
			if(code != 0 && revivir++ < 10)
				this.run();
		}).bind(this));
	}
}

util.inherits(PluginManager, EventEmitter);

PluginManager.prototype.spawnArgs = [
	'cwd',
	'stdio',
	'env',
	'detached',
	'uid',
	'gid'
].slice(0);

PluginManager.prototype.run = function(){
	var opts = { //Default
		cwd: undefined,
		env: process.env
	};

	for(var i=0, k; k=this.spawnArgs[i]; i++)
		if(this.c.hasOwnProperty(k))
			opts[k] = this.c[k];

	this.inst = ChildProcess.spawn(this.bin, this.args, opts);
	this.inst.stdout.on('data', this._readStdOut.bind(this));
	this.inst.stderr.on('data', this._readStdErr.bind(this));
	this.inst.on('close', this._hasDied.bind(this));
};

PluginManager.prototype._readStdOut = function(data){
	var str = data.toString().split("\n");
	for(var i=0, s; s=str[i]; i++)
		this._executeCb(s);
};

PluginManager.prototype._executeCb = function(data){
	var Json = {
		id: 0,
		error: -1,
		error_message: "Error parseando Json"
	};
	try{
		Json = JSON.parse(data);
	}catch(e){
	}

	var cb = this.cbs[Json.id];
	if(cb){
		if(typeof(cb) == 'function'){
			cb(Json.error || 0, Json);
		}
		delete this.cbs[Json.id];
	}

	this.emit('message', Json.error || 0, Json.id || 0, Json);
};

PluginManager.prototype._readStdErr = function(data){
	console.log("Stderr: '"+data+"'");
};

PluginManager.prototype._hasDied = function(code){
	console.log("Mori con codigo: "+code);
	this.emit('close', code);
};

PluginManager.prototype.sendMessage = function(event, data, cb){
	(typeof(data) != 'string') && (data = QueryString.stringify(data) );
	var id = (this.count++),
		message = ""+id+":"+event+":"+data;
	(typeof(cb) == "function") && (this.cbs[id] = cb);
	this.inst.stdin.write(message+"\n");
};

PluginManager.prototype.extendArgs = function(defArgs, args){
	return ((defArgs instanceof Array) ? defArgs : []).concat((args instanceof Array) ? args : []);
};

PluginManager.prototype.extendConfig = function(defConfig, config){
	var newConfig = {}
	for (var key in defConfig)
		newConfig[key] = defConfig[key];

	for (var key in config)
		(typeof(config[key]) == 'undefined') && (newConfig[key] = defConfig[key]);

	return newConfig;
};

module.exports = PluginManager;
