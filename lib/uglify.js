var uglify =    require('uglify-js').uglify,
    parser =    require('uglify-js').parser,
    file =      require('./util/file'),
    loop =      require('./util/loop'),
    src = '',
    fileData = [],
    config = require('../config');

// Read sencha touch library.
src += file.readSync('../touch/sencha-touch-all.js');

// Read and compile app files.
file.traverse(config.source, function (arr) {
  loop.asyncFor(arr.length, function (loop) {
    var filename = arr[loop.iteration()],
        ext = filename.substr(filename.lastIndexOf('.'));
    
    if(ext != '.js') {
      loop.next();
      return;
    }
    
    // Build dependencies list
    file.read(filename, 'utf-8', function (err, data) {
      fileData.push(parseExtFile(data));
      loop.next();
    });
  }, function () {
    // Sort through file data.
    fileData = sortFiles(fileData);   
    
    fileData.forEach(function (data) {
      src += data.code;
      console.log(data.defines);
    });
    
    // Write src to file.
    writeCodeToFile(src);
  });
});

// Use topological sorting to sort the files into the
// correct order based on dependencies.
function sortFiles(fileList) {
  var list = [];
  
  // Find all the files that are not required by anything else.
  fileList.forEach(function (node) {
    var depth = true;
    
    fileList.forEach(function (other) {
      if(other.requires.indexOf(node.defines) != -1) {
        depth = false;
      }
    });
    
    if(depth == true) {
      visit(node);
    }
  });
  
  // Follow each node through its dependencies to build a tree.
  function visit(node) {
    if(!node.visited) {
      node.visited = true;
      fileList.forEach(function (other) {
        if(node.requires.indexOf(other.defines) != -1) {
          visit(other);
        }
      });
      if(node.defines != '') {
        list.push(node);
      }      
    }
  };
  
  // Drop all files that do not define anything to the bottom.
  // These are more than likely being run on include like app.js
  fileList.forEach(function (node) {
    if(node.defines == '') {
      list.push(node);
    }
  });
  
  return list;
};

// Figure out what the class requires, extends, and defines
// and insert this into an object.
function parseExtFile(source) {
  var params = {
    requires: [],
    code: source,
    defines: ''
  };
  
  // Find what the code requires.
  var requires = source.match(/requires\:\ \[[A-z.,' \n]+\]/g);
  if(requires) {
    requires = requires[0];
    requires = requires.substring(requires.indexOf('['), requires.lastIndexOf(']') + 1);
    requires = eval(requires);
    params.requires = requires;
  }
  
  // Find out what it extends and add it to requires.
  var extend = source.match(/extend\: [A-z.' ]+\,/g);
  if(extend) {
    extend = extend[0];
    extend = extend.substring(extend.indexOf('\''), extend.lastIndexOf(','));
    extend = eval(extend);
    params.requires.push(extend);
  }
  
  // Find what it defines.
  var defines = source.match(/Ext\.define\([A-z.' ]+\,/g);
  if(defines) {
    defines = defines[0];
    defines = defines.substring(defines.indexOf('(') + 1, defines.lastIndexOf(','));
    defines = eval(defines);
    params.defines = defines;
  }
  
  params.defines = params.defines.trim();
  params.requires.forEach(function (el, i) {
    params.requires[i] = params.requires[i].trim();
  });
  
  // Get rid of Ext requires
  var i = params.requires.length;
  while(i--) {
    if(params.requires[i].substr(0, 3) == 'Ext') {
      params.requires.splice(i, 1);
    }
  }
  
  return params;
};

function writeCodeToFile(code) {
  console.log('Compiling ast...');
  
  // Compile source text.
  var ast = parser.parse(code);
  ast = uglify.ast_mangle(ast);
  ast = uglify.ast_squeeze(ast);
  
  console.log('Compiling final code...');
  
  var finalCode = uglify.gen_code(ast, config.uglify);
  
  var filename = '../dist/' + config.output + '-' + config.version + '.js';
  
  // Write code to file.
  file.write(filename, finalCode, function (err) {
    if(err) {
      throw err;
    } else {
      console.log('Complete!');
      console.log('File written to ' + filename);
    }
  });
};