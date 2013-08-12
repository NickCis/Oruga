var express = require('express'),
	path = require('path'),
	http = require('http'),
	fs = require('fs'),
	Pluginify = require(path.join(__dirname, 'Pluginify'));

function OrugaServer(config){
	this.c = config || {};
	(this.c.port) || (this.c.port = 3000);
	(this.c.staticFolder) || (this.c.staticFolder = path.join(__dirname, 'static'));
	(this.c.pluginList) || ( this.c.pluginList = path.join(__dirname, "../") + "/*");
	this.plugins = new Pluginify(this.c.pluginList);
	this.server = express();
	this.plugins.loadAll();

	this.server.configure( (function(){
		this.server.set('port', this.c.port);
		this.server.use(express.favicon());
		this.server.use(express.logger('dev'));
		this.server.use(express.compress());
		this.server.use(express.bodyParser());
		this.server.use(express.methodOverride());
		//this.server.use(express.cookieParser('Oruga'));
		//this.server.use(express.session());
		this.server.use(this.server.router);
		this.server.use('/static', express.directory(this.c.staticFolder));
		this.server.use('/static', express.static(this.c.staticFolder));
	}).bind(this));

	this.server.configure('development', (function(){
		this.server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	}).bind(this));

	this.server.configure('production', (function(){
		this.server.use(express.errorHandler());
	}).bind(this));

	this.server.get('/', (function(req, res){
		res.sendfile(path.join(this.c.staticFolder, 'index.html'));
	}).bind(this));

	this.server.get('/index.html', (function(req, res){
		res.sendfile(path.join(this.c.staticFolder, 'index.html'));
	}).bind(this));

	this.server.get('/plugins/:name/:event', (function(req, res){
		var name = req.params.name,
		event = req.params.event,
		data = req.query;

		this.plugins.sendMessage(name, event, data, this.buildResponse(req, res));
	}).bind(this));
}

OrugaServer.prototype.buildResponse = function(req, res){
	return function(error, Json){
		res.send(Json);
	};
};

OrugaServer.prototype.run = function(){
	this.http = http.createServer(this.server).listen(this.server.get('port'), (function(){
		console.log("Oruga server listening on port " + this.server.get('port'));
	}).bind(this));
}

module.exports = OrugaServer;
