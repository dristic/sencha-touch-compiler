Sencha Touch Compiler
=====================

A compiler for Sencha touch files written in nodejs and uglify. This will take all your application files in a given directory and uglify them along with the sencha touch library into one file. This way all your app will need to do is include one .js file... to rule them all.

## Getting Started

Either download or clone the project. The two external dependencies are nodejs and sencha touch. Download and install nodejs if you have not already done so. Sencha touch can be downloaded from the Sencha web site and put `sencha-touch-all.js` into the /touch/ folder.

All the configuration is run through the `config.js` file. Edit that file then either run `node uglify.js` in the /lib/ directory or run `sencha-touch-compiler` in the /bin/ directory.

Your minified file will be in /dist/ under the name `{config.output}-{config.version}.js`

## Config.js Parameters

* `version`: Gets added to the output file's name
* `source`: The folder that your source files are contained in
* `output`: The name of the output file (omit extensions, etc.)
* `uglify`: The parameters to pass into uglify when uglify-ing the source. I recommend turning beautify off after you understand how it works.

## Misc

The regex patterns need to be improved so if you are getting issues ensure all your define, require, and extends statements are in perfect syntax.

Licensed under the MIT license provided under `LICENSE.txt`. Feel free to make pull requests and issues and I will look at them when I can.

## To-Do

* Create more CLI-based structure
* Compile css/scss/styl files
* More options for including additional libraries (phonegap, etc.)

