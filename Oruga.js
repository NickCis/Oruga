var dummy = require('./plugins/dummy/dummy.js'),
	d = new dummy();

d.run();

d.sendMessage("asdasd", "asdasd", function(error, Json){
	console.log('Mensaje 1');
	console.log("\tError: "+error);
	console.log(Json);
});

d.sendMessage("bbbbbbbbbbbbb", "a=1&b=2", function(error, Json){
	console.log('Mensaje 2');
	console.log("\tError: "+error);
	console.log(Json);
});
