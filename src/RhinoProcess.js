var Node = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3
}

console = {
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

  this.env = new JspScript.Env(domParserFunction);

  this.outFile = new java.io.File(outFileName);
  this.outFile.createNewFile();

  this.outWriter = new java.io.PrintWriter(this.outFile);
}

RhinoProcessor.prototype.emit = function(script) {
  this.outWriter.print(script);
};

RhinoProcessor.prototype.close = function() {
  this.outWriter.close();
};

RhinoProcessor.prototype.processFile = function(inFileName) {
  var inFile = new java.io.File(inFileName);
  var reader = new java.io.BufferedReader(new java.io.FileReader(inFile));
  var input = '';
  var line;
  while ((line = reader.readLine()) != null) {
    input += line;
    input += '\n';
  }
  reader.close();
  print(input);

//  var template = env.createTemplateFromString(input);
//  print(template);

  var sourceDom = this.env.createDomFromString(input + "");
  var generator = new JspScript.Generator(this.env);
  var scribe = new JspScript.Scribe();
  generator.generateFunctionBody(sourceDom.childNodes, scribe);

  var fnName = (inFileName + "").replace(/\./g, '_').replace(/\//g, '__');
  var script = "function " + fnName + "(attrs, tagContext) {\n" + scribe.getScript() + "\n}";

  this.emit(script);
};

var rhinoProcessor = new RhinoProcessor('demo/generated.js');
rhinoProcessor.processFile('demo/page.jsp');
rhinoProcessor.processFile('demo/test.tag');
rhinoProcessor.close();
