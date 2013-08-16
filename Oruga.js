var path = require('path'),
	orugaServer = require("oruga_server").OrugaServer,
	server = new orugaServer({
		staticFolder: path.join(__dirname, 'static'),
		pluginList: [
			//path.join(__dirname, 'node_modules')+"/*",
			{ name: "dummy", path: "oruga_dummy"},
			{ name: "indexeador", path: "oruga_indexeador"}
		]
	});

server.run();
