var DbHandle = require('./plugins/dbhandle/DbHandle'),
	db = new DbHandle();


db.run();

db.sendMessage("asdasd", "asdasd", function(error, Json){
	console.log('mensaje 1');
	console.log("Error: "+error);
	console.log(Json);
});

db.sendMessage("bbbbbbbbbbbbb", "asdasd", function(error, Json){
	console.log('mensaje 2');
	console.log("Error: "+error);
	console.log(Json);
});
