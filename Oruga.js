var path = require('path'),
	OrugaServer = require("OrugaServer").OrugaServer,
	server = new OrugaServer({
		staticFolder: path.join(__dirname, 'static'),
		pluginList: [
			path.join(__dirname, 'plugins')+"/*",
			{ name: "dummy", path: "orugaDummy"}
		]
	});

server.run();
