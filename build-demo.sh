#!/bin/bash

baseDir=.

java -jar $baseDir/lib/js.jar -strict -w \
	-f $baseDir/src/JspScript.js \
	-f $baseDir/src/CoreTaglib.js \
	-f $baseDir/src/Generator.js \
	-f $baseDir/src/RhinoProcess.js \
