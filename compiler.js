#!/usr/bin/env node
var program = require('commander'),
	sass = require('node-sass'),
	path = require('path'),
	fs = require('fs');

program
	.version('0.0.1')
	.usage('scss-compiler')
	.option('-s, --source [value]', 'source folder/file path')
	.option('-d, --dest [value]', 'destination folder')
	.option('-o, --output-style [value]', 'CSS output style (nested|expanded|compact|compressed)')
	.option('-c, --comments [value]', 'Include debug info in output (none|normal|map)')
	//.option('-p, --package [value]', 'if specified, package all templates from destination folder into specified file')
	.parse(process.argv);

program.source = program.source || path.join(__dirname, "src", "scss");
program.dest = program.dest || path.join(__dirname, "static", "css");
mkdirordie(program.dest);

function mkdirordie(path) {
	require("mkdirp")(path, function (err) {
		if (err) {
			console.error(err);
			process.exit(1);
		}
	});
}

console.log("Compiling scss from '" + program.source+"'");
for(var i=0, folder, folders = fs.readdirSync(program.source); folder = folders[i]; i++){
	//TODO: is it a folder?
	for(var k=0, file, files = fs.readdirSync(path.join(program.source, folder)); file = files[k]; k++){
		if(! /^_.*$/.test(file) && /\.scss$/.test(file)){
			(function(folder, file){
				var outName =   file.replace(/\.scss/, '.css');
				if(folder != file.replace(/\.scss/, ''))
					outName = folder+'-'+outName;
				sass.render({
					file: path.join(program.source, folder, file),
					includePaths: [path.join(program.source, folder)],
					outputStyle: program.outputStyle,
					sourceComments: program.comments,
					success: function(css){
						fs.writeFile(path.join(program.dest, outName), css, function(err){
							if(err)
								return console.log('Error: '+err);
							console.log(file+' [Ok]');
						});
					},
					error: function(err){
						console.log(file+' [Error]');
						console.log(err);
					}
				})
			})(folder, file);
		}
	}
}
