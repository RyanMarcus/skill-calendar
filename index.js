"use strict";

var FS = require("q-io/fs");
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
	console.log(toR);
			  
}


readTSV("example.csv").then(generateSVG);
