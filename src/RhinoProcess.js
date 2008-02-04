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
  var documentBuilderFactory = Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance();

  var domParserFunction = function(text) {
    print(text);
    var documentBuilder = documentBuilderFactory.newDocumentBuilder();
    var stringReader = new java.io.ByteArrayInputStream(new java.lang.String(text).getBytes());
    return documentBuilder.parse(stringReader);
  };

  this.env = new JspScript.Env('.', domParserFunction);
  var self = this;
  this.env.fetchFileContents = function(url) {
    print('Reading file ' + url);
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
}

RhinoProcessor.prototype.emit = function(script) {
  this.outWriter.print(script);
};

RhinoProcessor.prototype.close = function() {
  this.outWriter.close();
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
  var input = this.readFile(inFileName);

//  var template = env.createTemplateFromString(input);
//  print(template);

  var sourceDom = this.env.createDomFromString(input);
  var generator = new JspScript.Generator(this.env);
  var scribe = new JspScript.Scribe();
  generator.generateFunctionBody(sourceDom.childNodes, scribe, inFileName);

//  var fnName = (inFileName + "").replace(/([^a-zA-Z0-9])/g, function(match) {
//    return "_" + match.charCodeAt(0).toString(16);
//  });
  var script = "JspScript.__GENERATED__.uriToFnMap['" + inFileName + "'] = function(attrs, tagContext) {\n" +
               scribe.getScript() + "\n" +
               "}\n" +
               "\n";

  this.emit(script);
};

var rhinoProcessor = new RhinoProcessor('generated.js');
var jspFiles = new java.io.File('WEB-INF/jsp').listFiles();
for (var i = 0; i < jspFiles.length; i++) {
  var path = jspFiles[i].getPath();
  if (path.endsWith('.jsp') || path.endsWith('.jspf')) {
    rhinoProcessor.processFile(path + '');
  }
}
rhinoProcessor.processFile('WEB-INF/tags/x/test.tag');
rhinoProcessor.close();
