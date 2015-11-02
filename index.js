#! /usr/bin/env node

"use strict";

var FS = require("q-io/fs");
var Q = require("q");
var _ = require("underscore");
var util = require("util");



function readTSV(filename) {
	let skills = [];
	let info = [];
	return FS.read(filename).then(content => {
		return content.split("\n");
	}).then(lines => {
		return lines.map(line => {
			return line.split("\t");
		}).filter(cells => {
			return cells.length != 1;
		});
	}).then(rows => {
		skills = _.rest(_.first(rows));
		info = _.rest(rows).map(row => {
			return {"year": _.first(row),
				"levels": _.rest(row)};
		});
		
		info.forEach((item, idx) => {
			item.idx = idx;
		});

		info.forEach(item => {
			item.levels = item.levels.map((level, idx) => {
				return {"idx": idx,
					"level": level};
			});
		});

		return {"skills": skills,
			"info": info};
	}).catch(e => {
		console.log("Error: " + e);
	});
}


function generateSVG(data) {
	// first, we calculate the width and height we need
	let width = 0;
	let widthWithKey = 0;
	let height = 0;
	let toR = "";

	// we need to calculate the width of the widest
	// label. We don't have good font metrics so we 
	// will guess a fixed width
	let textBound = 8 * _.max(data.skills.map(skill => skill.length));
	let headerSpace = 40;

	height = data.skills.length * 21 + headerSpace;
	width = data.info.length * 26 + textBound + 2;
	widthWithKey = width + 150;

	toR += util.format
	('<svg xmlns="http://www.w3.org/2000/svg" width="%s" height="%s">',
	 widthWithKey, height);


	// gradient defintion
	toR += '<defs>';
	toR += '<linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">';
	toR += '<stop offset="30%" style="stop-color:rgb(255,255,255);stop-opacity:1" />';
	toR += '<stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:1" />';
	toR += '</linearGradient>';
	toR += '</defs>';

	// key
	var keyOffset = 40;
	toR += util.format
	('<circle cx="%s" cy="%s" r="%s" fill="black" stroke="black" stroke-width="1"/>',
	 width + (keyOffset - 10), 95, 5);

	toR += util.format
	('<text x="%s" y="%s">%s</text>',
	 width + keyOffset, 100, 'Heavy usage');

	toR += util.format
	('<circle cx="%s" cy="%s" r="%s" fill="url(#grad)" stroke="black" stroke-width="1"/>',
	 width + (keyOffset - 10), 115, 5);

	toR += util.format
	('<text x="%s" y="%s">%s</text>',
	 width + keyOffset, 120, 'Moderate usage');

	toR += util.format
	('<circle cx="%s" cy="%s" r="%s" fill="white" stroke="black" stroke-width="1" />',
	 width + (keyOffset - 10), 135, 5);

	toR += util.format
	('<text x="%s" y="%s">%s</text>',
	 width + keyOffset, 140, 'No usage');
	



	// skills
	toR += data.skills.map((skill, idx) => {
		return util.format('<text x="%s" y="%s" text-anchor="end">%s</text>',
				  textBound - 5, 20 * (idx+1) + headerSpace, skill);
	}).join("\n");
	toR += "\n";

	
	// vertical line
	toR += util.format(
		'<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="black" stroke-width="1" />',
		textBound, headerSpace, textBound, height);


	// horiz line
	toR += util.format(
		'<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="black" stroke-width="1" />',
		textBound, headerSpace, width, headerSpace);
	
	/*
	  <line x1="20" y1="100" 
          x2="100" y2="20" 
          stroke="black" 
          stroke-width="2"/>
	 */

	// years
	toR += data.info.map((year, idx) => {
		return util.format(
			'<text x="%s" y="%s" transform="rotate(%s %s %s)">%s</text>',
			textBound + 15 + (idx * 25), 35, 
			-50, textBound + 15 + (idx * 25), 35,
			year.year);
	}).join("\n");

	// points
	toR += data.info.map((year, idx) => {
		return year.levels.map(level => {
			let fill = "white";
			if (level.level == "low") {
				fill = "url(#grad)";
			} else if (level.level == "high") {
				fill = "black";
			}
			return util.format(
				'<circle cx="%s" cy="%s" r="%s" fill="%s" stroke="black" stroke-width="1"/>',
				25 * (idx+1) + (textBound-7),
				headerSpace + 15 + (level.idx * 20), 
				5,
				fill);
		}).join("\n");
	}).join("\n");
	

	toR += "</svg>";
	return toR;
			  
}


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
		return readTSV(filename);
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

let chain = [readTSVFunction(argv._[0]), generateSVG];


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
