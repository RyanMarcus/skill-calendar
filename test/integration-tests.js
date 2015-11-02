"use strict";

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

	it("should write to a PNG file", () => {
		if (shell.test("-f", "test.png")) {
			shell.rm("test.png");
		}

		silent("./index.js --png test.png test/example.csv");
		assert(shell.test("-f", "test.png"));
		assert(shell.cat("test.png").length > 50);
		shell.rm("test.png");
	});

	it("should write to both a PNG and an SVG file", () => {
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
});
