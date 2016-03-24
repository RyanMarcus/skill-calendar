"use strict";

// Copyright 2015 Ryan Marcus
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

var assert = require("assert");
var shell = require("shelljs");


function silent(cmd) {
    return shell.exec(cmd, {"silent": true});
}

describe("the CLI", function () {
    it("should print a help message with no arguments", () => {
	let res = silent("./index.js");
	assert(res.output.startsWith("usage"));
    });

    it("should print out SVG when given an example file", () => {
	let res = silent("./index.js test/example.csv"); 
	assert(res.output.startsWith("<svg"));
	assert(res.output.endsWith("</svg>\n"));
	assert(res.output.indexOf("circle") != -1);
    });

    it("should produce a different value when optimized", () => {
	let resOp = silent("./index.js test/example.csv");
	let resNoOp = silent("./index.js --no-optimize test/example.csv"); 

	assert(resOp.output.length < resNoOp.output.length);
    });

    it("should write to an SVG file", () => {
	if (shell.test("-f", "test.svg")) {
	    shell.rm("test.svg");
	}

	silent("./index.js --svg test.svg test/example.csv");
	assert(shell.test("-f", "test.svg"));
	assert(shell.cat("test.svg").length > 50);
	shell.rm("test.svg");
    });

    it("should write to a PNG file", function() {
	this.timeout(5000);
	if (shell.test("-f", "test.png")) {
	    shell.rm("test.png");
	}

	silent("./index.js --png test.png test/example.csv");
	assert(shell.test("-f", "test.png"));
	assert(shell.cat("test.png").length > 50);
	shell.rm("test.png");
    });

    it("should write to both a PNG and an SVG file", function() {
	this.timeout(5000);
	if (shell.test("-f", "test.png")) {
	    shell.rm("test.png");
	}

	if (shell.test("-f", "test.svg")) {
	    shell.rm("test.svg");
	}


	silent("./index.js --png test.png --svg test.svg test/example.csv");
	assert(shell.test("-f", "test.png"));
	assert(shell.test("-f", "test.svg"));
	assert(shell.cat("test.png").length > 50);
	assert(shell.cat("test.svg").length > 50);

	shell.rm("test.png");
	shell.rm("test.svg");
    });

    it("should produce SVGs with sensical size", () => {
	let res = silent("./index.js test/example.csv").output; 
	let res2 = silent("./index.js test/example2.csv").output; 
	
	assert(res.length > res2.length);
	
    });
});
