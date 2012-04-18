var fs =    require('fs'),
    path =  require('path'),
    loop =  require('./loop');

module.exports = (function () {
  var file = {};
  
  /**
   * Traverses through a director recursively and returns an array of
   * all the files in the directory.
   * @param path {String} The path to traverse.
   * @param callback {Function} The function to call when done. function (results) {}
   */
  file.traverse = function (path, callback, each) {
    var arr = [];
    
    fs.readdir(path, function (err, files) {
      loop.asyncFor(files.length, function (loop) {
        var currentFile = path + '/' + files[loop.iteration()];
        
        fs.stat(currentFile, function (err, stats) {
          if(stats.isFile()) {
            arr.push(currentFile);
            if(each) each(currentFile);
            loop.next();
          } else if(stats.isDirectory()) {
            file.traverse(currentFile, function (results) {
              arr = arr.concat(results);
              loop.next();
            }, each);
          }
        });
      }, function () {
        callback(arr);
      });
    });
  };
  
  /**
   * Reads all the files in a path and returns the text of them all
   * in concatenated form.
   * @param path {String} The path to traverse.
   * @param callback {Function} The function to call when completed. function (text) {}
   */
  file.readAll = function (path, options, callback) {
    var src = '';
    
    file.traverse(path, function (results) {
      loop.asyncFor(results.length, function (loop) {
        var filename = results[loop.iteration()],
            ext = filename.substr(filename.lastIndexOf('.'));
        
        // Filter out certain extensions if provided.
        if(options.filters) {
          if(options.filters.indexOf(ext) != -1) {
            loop.next();
            return;
          }
        }
        
        // If only is provided ensure the extension is included.
        if(options.only) {
          if(options.only.indexOf(ext) == -1) {
            loop.next();
            return;
          }
        }
        
        // If not is provided ensure the file is not filtered out.
        if(options.not) {
          if(options.not.indexOf(filename) != -1) {
            loop.next();
            return;
          }
        }
        
        fs.readFile(results[loop.iteration()], 'utf-8', function (err, text) {
          src += text;
          loop.next();
        });
      }, function () {
        callback(src);
      });
    });
  };
  
  /**
   * Writes a file and creates any directories it needs to first.
   * @param filename {String} The full path of the file to create.
   * @param text {String} The text in the file.
   * @param callback {Function} The function to call when complete.
   */
  file.write = function (filename, text, callback) {
    if(filename.search('/') > -1) {
      var dir = filename.substring(0, filename.lastIndexOf('/'));
      if(path.existsSync(dir) == false) {
        fs.mkdirSync(dir);
      }
    }
    
    fs.writeFile(filename, text, callback);
  };
  
  /**
   * Aliases
   */
  file.read = fs.readFile;
  file.readSync = fs.readFileSync;
  file.writeSync = fs.writeFileSync;
  file.makeDir = fs.mkdir;
  file.makeDirSync = fs.mkdirSync;
  
  file.path = path;
  file.fs = fs;
  
  return file;
})();