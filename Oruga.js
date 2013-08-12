var path = require('path'),
	orugaServer = require("oruga_server").OrugaServer,
	server = new orugaServer({
		staticFolder: path.join(__dirname, 'static'),
		pluginList: [
			path.join(__dirname, 'plugins')+"/*",
			{ name: "dummy", path: "oruga_dummy"}
		]
	});

server.run();
