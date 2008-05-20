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

JspScript.Generator.prototype.generateFunctionBody = function(iNode) {
  this.prolog();
  this.emit_(iNode);
  this.epilog();
};

JspScript.Generator.prototype.emit_ = function(iNode) {
  var i;
  if (iNode instanceof JspScript.Parser.TextNode) {
    this.text(iNode.text);
  } else if (iNode instanceof JspScript.Parser.ElNode) {
    this.expression(iNode.el);
  } else if (iNode instanceof JspScript.Parser.DomNode) {
    this.element(iNode.tagName, iNode.attrs, iNode.children.length > 0);
    for (i = 0; i < iNode.children.length; i++) {
      this.emit_(iNode.children[i]);
    }
    if (iNode.children.length > 0) {
      this.pop();
    }
  } else if (iNode instanceof JspScript.Parser.TaglibDeclarationNode) {
    this.taglibDeclaration(iNode.prefix, iNode.url);
  } else if (iNode instanceof JspScript.Parser.TagCallNode) {
    this.tagStart(iNode.prefix, iNode.name, iNode.attrs);
    for (i = 0; i < iNode.children.length; i++) {
      this.emit_(iNode.children[i]);
    }
    this.tagEnd();
  } else if (iNode instanceof JspScript.Parser.INode) {
    for (i = 0; i < iNode.children.length; i++) {
      this.emit_(iNode.children[i]);
    }
  } else {
    throw new Error('unknown node!');
  }
};

JspScript.Generator.prototype.emitAttrValue_ = function(iNode) {
  for (var i = 0; i < iNode.value.length; i++) {
    var valueNode = iNode.value[i];

    if (i > 0) {
      this.put('+');
    }

    if (valueNode instanceof JspScript.Parser.TextNode) {
      this.put('\'' + JspScript.jsEsc(valueNode.text) + '\'');
    } else if (valueNode instanceof JspScript.Parser.ElNode) {
      this.put('(' + valueNode.el + ')');
    } else {
      throw new Error('unknown node!');
    }
  }
};

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
  this.put((hasChildren ? 'q' : 'a') +
      '(\'' + JspScript.jsEsc(tagName) + '\'');

  for (var i = 0; i < attributes.length; i++) {
    this.put(',\'');
    var attribute = attributes[i];
    this.put(JspScript.jsEsc(attribute.name));
    this.put('\',');
    this.emitAttrValue_(attribute);
  }
  this.put(');\n');
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
    var attribute = attributes[i];
    this.put(JspScript.jsEsc(attribute.name));
    this.put(':');
    this.emitAttrValue_(attribute);
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

JspScript.Generator.translateElExpression = function(elExpr) {
  var script = '';
  for (var i = 0; i < elExpr.tokens.length; i++) {
    var token = elExpr.tokens[i];
    switch(token.type) {
      case JspScript.Parser.ElExpression.SYMBOL_LOOKUP:
        script += 'g(\'' + token.value + '\')';
        break;
      case JspScript.Parser.ElExpression.FUNCTION_LOOKUP:
        script += 'f(\'' + token.taglibNs + '\',\'' + token.value + '\')';
        break;
      case JspScript.Parser.ElExpression.JS_CODE_LITERAL:
        script += token.value;
        break;
      default:
        throw new Error('unknown token type "' + token.type + '"');
    }
  }
  return script;
};