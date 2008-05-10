JspScript.Generator = function() {
  this.out_ = '';
  this.noClose = false;
}

JspScript.Generator.escRe = /(['\\])/g;
JspScript.Generator.newlineRe = /\n/g;

JspScript.Generator.prototype.put = function(s) {
  this.out_ += s;
}

JspScript.jsEsc = function(s) {
  return s.replace(JspScript.Generator.escRe, '\\$1').replace(JspScript.Generator.newlineRe, '\\n');
};

JspScript.Generator.prototype.getScript = function() {
  return this.out_;
}

JspScript.Generator.prototype.preface = function() {
};

JspScript.Generator.prototype.afterward = function() {
};

JspScript.Generator.prototype.prolog = function() {
  this.put(
      'var top = [];\n'
      + 'var stack = [];\n'
      + 'var parent = { appendChild: function(e) { top.push(e); } };\n'
      + 'var template = this;\n'
      + 'function a() {\n'
      + '  var e = document.createElement(arguments[0]);\n'
      + '  for (var i = 1; i < arguments.length; i+=2) {\n'
      + '    e.setAttribute(arguments[i], arguments[i+1]);\n'
      + '  }\n'
      + '  parent.appendChild(e);\n'
      + '}\n'
      + 'function q() {\n'
      + '  var e = document.createElement(arguments[0]);\n'
      + '  for (var i = 1; i < arguments.length; i+=2) {\n'
      + '    e.setAttribute(arguments[i], arguments[i+1]);\n'
      + '  }\n'
      + '  parent.appendChild(e);\n'
      + '  stack.push(parent);\n'
      + '  parent = e;\n'
      + '}\n'
      + 'function z() {\n'
      + '  parent = stack.pop();\n'
      + '}\n'
      + 'function w(t) {\n'
      + '  parent.appendChild(document.createTextNode(t));\n'
      + '}\n'
      + 'function x(t) {\n'
      + '  parent.appendChild(t instanceof Node ? t : document.createTextNode(t));\n'
      + '}\n'
      + 'function n(prefix, tag, tagAttrs, bodyFn) {\n'
      + '  var origTop = top; top = [];\n'
      + '  var origStack = stack; stack = [];\n'
      + '  var origParent = parent; parent = { appendChild: function(e) { top.push(e); } };\n'
      + '  var tagContext = new JspScript.TagContext(this, bodyFn, attrs);\n'
      + '  try {\n'
      + '    var results = template.doTag_(prefix, tag, tagAttrs, parent, tagContext);\n'
      + '    top = origTop;\n'
      + '    for (var i = 0; i < results.length; i++) origParent.appendChild(results[i]);\n'
      + '    var keepTop = top;\n'
      + '    return keepTop;\n'
      + '  } finally {\n'
      + '    top = origTop; stack = origStack; parent = origParent;\n'
      + '  }\n'
      + '}\n'
      + 'function e(a) {\n'
      + '  for (var i = 0; i < a.length; i++) parent.appendChild(a[i]);\n'
      + '}\n'
      + 'function g(t) {\n'
      + '  return attrs[t];\n'
      + '}\n'
      + 'function f(prefix,name) {\n'
      + '  return template.findFunction_(prefix,name);\n'
      + '}\n');
};

JspScript.Generator.prototype.epilog = function() {
  this.put('return top;\n');
};

JspScript.Generator.prototype.text = function(s) {
  this.put('w(\'' + JspScript.jsEsc(s) + '\');\n');
};

JspScript.Generator.prototype.expression = function(s) {
  this.put('x(' + s + ');\n');
};

JspScript.Generator.prototype.element = function(tagName, attributes, hasChildren) {
  var attrList = '';
  for (var i = 0; i < attributes.length; i++) {
    attrList += ',\'';
    var attribute = attributes[i];
    attrList += JspScript.jsEsc(attribute.name + ""); // todo: test stringification
    attrList += '\',';
    attrList += attribute.value + ""; // todo: test stringification
  }
  this.put((hasChildren ? 'q' : 'a') +
      '(\'' + JspScript.jsEsc(tagName) + '\'' + attrList + ');\n');
};

JspScript.Generator.prototype.pop = function() {
  this.put('z();\n');
};

JspScript.Generator.prototype.taglibDeclaration = function(prefix, uri) {
//  if (!this.haveTaglibPrefixes_) {
//    this.haveTaglibPrefixes_ = true;
//    this.put('this.taglibPrefixes_ = {};');
//  }
  this.put('this.taglibPrefixes_[\'' + JspScript.jsEsc(prefix) + '\'] = \'' + JspScript.jsEsc(uri) + '\';\n');
};

JspScript.Generator.prototype.attrJson = function(attributes) {
  this.put('{');
  for (var i = 0; i < attributes.length; i++) {
    if (i > 0) this.put(',');
    this.put(attributes[i].name + "");  // todo: test stringification
    this.put(':');
    this.put(attributes[i].value + "");  // todo: test stringification
  }
  this.put('}');
};

JspScript.Generator.prototype.jspTagCall = function(tagName, attributes) {
  this.put('this.doJspTag_(\'' + JspScript.jsEsc(tagName) + '\', ');
  this.attrJson(attributes);
  this.put(', parent, attrs, tagContext);\n');
};

JspScript.Generator.prototype.tagStart = function(prefix, name, attributes) {
  if (prefix == 'jsp') {
    if (name == 'doBody') {
      this.put('e(tagContext.renderBody(null, attrs));\n');
      this.noClose = true;
      return;
    } else if (name == 'include') {
      this.put('this.doInclude_(');
      this.attrJson(attributes);
      this.put('.page, attrs, parent);\n');
      this.noClose = true;
      return;
    } else {
      throw new Error('unknown or unsupported tag <jsp:' + name + '/>');
    }
  }

  this.put('n(\'' + JspScript.jsEsc(prefix) + '\',\'' + JspScript.jsEsc(name) + '\', ');
  this.attrJson(attributes);
  this.put(', function(g, tagContext) {\n');

//  this.put('this.doTag_(\'' + JspScript.jsEsc(prefix) + '\',\'' + JspScript.jsEsc(name) + '\', ');
  //  this.attrJson(attributes);
  //  this.put(', parent,\n' +
  //      'new JspScript.TagContext(this, function(g, tagContext) {');
};

JspScript.Generator.prototype.tagEnd = function() {
  if (this.noClose) {
    this.noClose = false;
    return;
  }
  this.put('return top;\n}')
  this.put(', attrs);\n')
};
