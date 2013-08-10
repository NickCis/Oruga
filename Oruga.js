#!/usr/bin/node

var Pluginify = require('Pluginify'),
	express = require('express'),
	path = require('path'),
	http = require('http'),
	fs = require('fs'),
	plugins = new Pluginify(path.join(__dirname, "plugins")),
	server = express();

plugins.loadAll();

server.configure(function(){
	server.set('port', process.env.PORT || 3000);
	server.use(express.favicon());
	server.use(express.logger('dev'));
	server.use(express.compress());
	server.use(express.bodyParser());
	server.use(express.methodOverride());
	//server.use(express.cookieParser('Oruga'));
	//server.use(express.session());
	server.use(server.router);
	server.use('/static', express.directory(path.join(__dirname, 'static')));
	server.use('/static', express.static(path.join(__dirname, 'static')));
});

server.configure('development', function(){
	server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

server.configure('production', function(){
	server.use(express.errorHandler());
});

server.get(['/', '/index.html'], function(req, res){
	res.sendfile(path.join(__dirname, 'static', 'index.html'));
});

function buildResponse(req, res){
	return function(error, Json){
		res.send(Json);
	};
}
server.get('/plugins/:name/:event', function(req, res){
	var name = req.params.name,
		event = req.params.event,
		data = req.query;

	plugins.sendMessage(name, event, data, buildResponse(req, res));
});

http.createServer(server).listen(server.get('port'), function(){
	console.log("Express server listening on port " + server.get('port'));
});
