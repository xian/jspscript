var Node = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3
}

var console = {
  log: function() {
    var out = 'console.log: ';
    for (var i = 0; i < arguments.length; i++) {
      out += (i > 0 ? ', ' : '') + arguments[i];
    }
    print(out);
  },
  dir: function() {
    var out = 'console.dir: ';
    for (var i = 0; i < arguments.length; i++) {
      out += (i > 0 ? ', ' : '') + arguments[i];
    }
    print(out);
  }
}

function RhinoProcessor(outFileName) {
  print('Generating ' + outFileName + '...');
  var documentBuilderFactory = Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance();

  var domParserFunction = function(text) {
//    print(text);
    var documentBuilder = documentBuilderFactory.newDocumentBuilder();
    var stringReader = new java.io.ByteArrayInputStream(new java.lang.String(text).getBytes());
    return documentBuilder.parse(stringReader);
  };

  this.env = new JspScript.Env('.', domParserFunction);
  var self = this;
  this.env.fetchFileContents = function(url) {
//    print('Reading file ' + url);
    return self.readFile(url);
  }

  this.outFile = new java.io.File(outFileName);
  this.outFile.createNewFile();

  this.outWriter = new java.io.PrintWriter(this.outFile);

  this.emit(
      "// Generated file -- do not edit by hand!\n" +
      "\n" +
      "JspScript.__GENERATED__ = {};\n" +
      "JspScript.__GENERATED__.uriToFnMap = {};\n" +
      "\n" +
      "JspScript.Env.prototype.locateTemplate = function(uri) {\n" +
      "  return new JspScript.Template(JspScript.__GENERATED__.uriToFnMap[uri], this, uri);\n" +
      "};\n" +
      "\n"
    );

  var scribe = new JspScript.Scribe();
  scribe.preface();
  this.emit(scribe.getScript());
}

RhinoProcessor.prototype.emit = function(script) {
  this.outWriter.print(script);
};

RhinoProcessor.prototype.close = function() {
  var scribe = new JspScript.Scribe();
  scribe.afterward();
  this.emit(scribe.getScript());

  this.outWriter.close();
  print('Finished!');
};

RhinoProcessor.prototype.readFile = function(inFileName) {
  var inFile = new java.io.File(inFileName);
  var reader = new java.io.BufferedReader(new java.io.FileReader(inFile));
  var input = '';
  var line;
  while ((line = reader.readLine()) != null) {
    input += line;
    input += '\n';
  }
  reader.close();
  return input + '';
}

RhinoProcessor.prototype.processFile = function(inFileName) {
  print('  * ' + inFileName);
  var input = this.readFile(inFileName);

//  var template = env.createTemplateFromString(input);
//  print(template);

  var sourceDom = this.env.createDomFromString(input);
  var parser = new JspScript.Parser(this.env);
  var scribe = new JspScript.Scribe();
  parser.parseFunctionBody(sourceDom.childNodes, scribe, inFileName);

//  var fnName = (inFileName + "").replace(/([^a-zA-Z0-9])/g, function(match) {
//    return "_" + match.charCodeAt(0).toString(16);
//  });
  var script = "JspScript.__GENERATED__.uriToFnMap['" + inFileName + "'] = function(attrs, tagContext) {\n" +
               scribe.getScript() + "\n" +
               "}\n" +
               "\n";

  this.emit(script);
};

RhinoProcessor.prototype.listFiles_ = function(path) {
  var files = new java.io.File(path).listFiles();
  java.util.Arrays.sort(files);
  return files;
}

RhinoProcessor.prototype.processJspDir = function(jspDirPath) {
  var jspFiles = this.listFiles_(jspDirPath);
  for (var i = 0; i < jspFiles.length; i++) {
    var jspFile = jspFiles[i];
    var path = jspFile.getPath();
    if (jspFile.isDirectory()) {
      this.processTagLibDir(path);
    } else if (path.endsWith('.jsp') || path.endsWith('.jspf')) {
      this.processFile(path + '');
    }
  }
};

RhinoProcessor.prototype.processTagLibDir = function(tagLibDirPath) {
  var tagFiles = this.listFiles_(tagLibDirPath);
  for (var i = 0; i < tagFiles.length; i++) {
    var tagFile = tagFiles[i];
    var path = tagFile.getPath();
    var foundAny = false;
    if (path.endsWith('.tag')) {
      this.processFile(path + '');
      foundAny = true;
    }

    if (foundAny) {
      this.emit('// taglib ' + tagLibDirPath + '\n');
    }
  }
};

RhinoProcessor.prototype.processWebInfDir = function(webInfDirPath) {
  print('* Processing ' + webInfDirPath + '...');

  this.processJspDir(webInfDirPath + '/jsp');

  var tagLibDirs = this.listFiles_(webInfDirPath + '/tags');
  for (var i = 0; i < tagLibDirs.length; i++) {
    var tagLibDir = tagLibDirs[i];
    if (tagLibDir.isDirectory()) {
      this.processTagLibDir(tagLibDir.getPath());
    }
  }
};

var rhinoProcessor = new RhinoProcessor('generated.js');
rhinoProcessor.processWebInfDir('WEB-INF');
rhinoProcessor.close();
