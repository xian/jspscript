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

var documentBuilderFactory = Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance();
var env = new JspScript.Env(function(text) {
  print(text);
  var documentBuilder = documentBuilderFactory.newDocumentBuilder();
  var stringReader = new java.io.ByteArrayInputStream(new java.lang.String(text).getBytes());
  var document = documentBuilder.parse(stringReader);
  return document;
});

function processFile(inFileName) {
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

  var sourceDom = env.createDomFromString(input + "");
  var generator = new JspScript.Generator(env);
  var scribe = new JspScript.Scribe();
  generator.generateFunctionBody(sourceDom.childNodes, scribe);

  var fnName = (inFileName + "").replace(/\./g, '_').replace(/\//g, '__');
  var script = "function " + fnName + "(attrs, tagContext) {\n" + scribe.getScript() + "\n}";

  var outFileName = inFileName + '_generated.js';
  var outFile = new java.io.File(outFileName);
  outFile.createNewFile();

  var writer = new java.io.PrintWriter(outFile);
  writer.print(script);
  writer.close();
}

processFile('demo/page.jsp');
processFile('demo/test.tag');