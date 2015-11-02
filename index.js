#! /usr/bin/env node


//This file is part of skill-calendar.
// 
//skill-calendar is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.
// 
//skill-calendar is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	 See the
//GNU General Public License for more details.
// 
//You should have received a copy of the GNU General Public License
//along with skill-calendar.  If not, see <http://www.gnu.org/licenses/>.


"use strict";

var Q = require("q");
var gen = require("./gen.js");

function optAsPromise(txt) {
	var svgo = require('svgo');
	var opt = new svgo();
	
	var toR = Q.defer();
	opt.optimize(txt, optTxt => {
		toR.resolve(optTxt.data);
	});

	return toR.promise;
	
}

function readTSVFunction(filename) {
	return function() {
		return gen.readTSV(filename);
	};
}

function svgOutputFunction(filename) {
	return function (txt) {
		var toR = Q.defer();

		// TODO doesn't seem to work with q-io FS.writeFile...
		var fs = require("fs");
		fs.writeFile(filename, txt, function(err) {
			if (err) {
				toR.reject(err);
				return;
			}
			toR.resolve(txt);
		});

		return toR.promise;
		
	};
}

function createTempFile() {
	var tmp = require("tmp");
	var toR = Q.defer();
	tmp.file({"postfix": ".svg"}, function(err, path) {
		if (err) {
			toR.reject(err);
			return;
		}

		toR.resolve(path);
	});

	return toR.promise;
}

function convertToPNG(svgFile, pngFile) {
	var svg2png = require("svg2png");
	var toR = Q.defer();
	svg2png(svgFile, pngFile, function (err) {
		if (err) {
			toR.reject(err);
			return;
		}

		toR.resolve();
	});

	return toR.promise;
}

function pngOutputFunction(filename) {
	return function (txt) {
		let tmpFile = "";
		return createTempFile().then(tmp => {
			tmpFile = tmp;
			var doSVGOutput = svgOutputFunction(tmpFile);
			return doSVGOutput(txt);
		}).then(function () {
			return convertToPNG(tmpFile, filename);
		}).then(function () {
			return txt;
		});
	};

}



function printHelp() {
	console.log("usage: skill-calendar [options] file");
	console.log("\t--png output.png: outputs a PNG");
	console.log("\t--svg output.svg: outputs an SVG");
	console.log("\t--no-optimize: don't do SVG optimizations");
	console.log("If neither option is given, output is written to stdout.");
	process.exit(-1);
}


var argv = require('minimist')(process.argv.slice(2));

if (argv._.length != 1) {
	printHelp();
}

let chain = [readTSVFunction(argv._[0]), gen.generateSVG];


if (!('optimize' in argv) || argv.optimize) {
	chain.push(optAsPromise);
}

if (!('png' in argv) && !('svg' in argv)) {
	chain.push(console.log);
}



if ('png' in argv) {
	chain.push(pngOutputFunction(argv['png']));
}

if ('svg' in argv) {
	chain.push(svgOutputFunction(argv['svg']));
}

var result = Q();
chain.forEach(f => {
	result = result.then(f);
});

result.then(x => {
	process.exit(0);
}).catch(function (err) {
	console.log(err);
	process.exit(-1);
});
