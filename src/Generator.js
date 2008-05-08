JspScript.Scribe = function() {
  this.out_ = '';
  this.noClose = false;
}

JspScript.Scribe.escRe = /(['\\])/g;
JspScript.Scribe.newlineRe = /\n/g;

JspScript.Scribe.prototype.put = function(s) {
  this.out_ += s;
}

JspScript.jsEsc = function(s) {
  return s.replace(JspScript.Scribe.escRe, '\\$1').replace(JspScript.Scribe.newlineRe, '\\n');
};

JspScript.Scribe.prototype.getScript = function() {
  return this.out_;
}

JspScript.Scribe.prototype.preface = function() {
};

JspScript.Scribe.prototype.afterward = function() {
};

JspScript.Scribe.prototype.prolog = function() {
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

JspScript.Scribe.prototype.epilog = function() {
  this.put('return top;\n');
};

JspScript.Scribe.prototype.text = function(s) {
  this.put('w(\'' + JspScript.jsEsc(s) + '\');\n');
};

JspScript.Scribe.prototype.expression = function(s) {
  this.put('x(' + s + ');\n');
};

JspScript.Scribe.prototype.element = function(tagName, attributes, hasChildren) {
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

JspScript.Scribe.prototype.pop = function() {
  this.put('z();\n');
};

JspScript.Scribe.prototype.taglibDeclaration = function(prefix, uri) {
//  if (!this.haveTaglibPrefixes_) {
//    this.haveTaglibPrefixes_ = true;
//    this.put('this.taglibPrefixes_ = {};');
//  }
  this.put('this.taglibPrefixes_[\'' + JspScript.jsEsc(prefix) + '\'] = \'' + JspScript.jsEsc(uri) + '\';\n');
};

JspScript.Scribe.prototype.attrJson = function(attributes) {
  this.put('{');
  for (var i = 0; i < attributes.length; i++) {
    if (i > 0) this.put(',');
    this.put(attributes[i].name + "");  // todo: test stringification
    this.put(':');
    this.put(attributes[i].value + "");  // todo: test stringification
  }
  this.put('}');
};

JspScript.Scribe.prototype.jspTagCall = function(tagName, attributes) {
  this.put('this.doJspTag_(\'' + JspScript.jsEsc(tagName) + '\', ');
  this.attrJson(attributes);
  this.put(', parent, attrs, tagContext);\n');
};

JspScript.Scribe.prototype.tagStart = function(prefix, name, attributes) {
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

JspScript.Scribe.prototype.tagEnd = function() {
  if (this.noClose) {
    this.noClose = false;
    return;
  }
  this.put('return top;\n}')
  this.put(', attrs);\n')
};



JspScript.Generator = function(env) {
  this.env_ = env;
  this.currentUrl_ = null;
}

JspScript.Generator.prototype.generateFunctionBody = function(nodes, scribe, url) {
  var previousUrl = this.currentUrl_;
  this.currentUrl_ = url || null;
  try {
    scribe.prolog();
    this.walkNodes_(nodes, scribe);
    scribe.epilog();
  } finally {
    this.currentUrl_ = previousUrl;
  }
};

JspScript.Generator.prototype.walkNodes_ = function(nodes, scribe) {
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes.item(i);
    //noinspection JSUnresolvedVariable
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        this.genTextCode_(node.nodeValue + "", scribe);
        break;

      case Node.ELEMENT_NODE:
        this.genElementCode_(node, scribe);
        break;
    }
  }
}

JspScript.Generator.prototype.genAttributesCode_ = function(attributes) {
  var attrsOut = [];
  var needPlus = false;
  var out = '';

  var attrScribe = {
    text: function(s) {
      if (needPlus) out += '+'; needPlus = true;
      out += '\'' + JspScript.jsEsc(s) + '\'';
    },
    expression: function(s) {
      if (needPlus) out += '+'; needPlus = true;
      out += s;
    }
  }

  for (var i = 0; i < attributes.length; i++) {
    var attribute = attributes.item(i);
    this.genTextCode_(attribute.value + "", attrScribe);

    var attr = {
      name: JspScript.jsEsc(attribute.name + ""),
      value: out
    };

    attrsOut.push(attr);
    needPlus = false;
    out = '';
  }
  return attrsOut;
}

JspScript.Generator.prototype.genTextCode_ = function(text, scribe) {
  JspScript.Template.RE_EL.lastIndex = 0;

  var start = 0;
  var match;
  while ((match = JspScript.Template.RE_EL.exec(text))) {
    if (start < match.index) {
      scribe.text(text.substring(start, match.index));
      start = match.index;
    }

    if (match[0][0] == '\\') { // escaped expression: \${xxx}
      scribe.text(match[0].substring(1));
    } else {
      var expr = this.env_.translateExpression(match[1]);
      scribe.expression(expr);
    }

    start = JspScript.Template.RE_EL.lastIndex;
  }

  if (start < text.length) {
    scribe.text(text.substring(start));
  }
};


JspScript.Generator.prototype.genElementCode_ = function(el, scribe) {
  var hasChildren = el.childNodes.length > 0;

  var atMatch = JspScript.Template.RE_TAG_AT.exec(el.tagName + ""); // todo: test stringification
  if (atMatch) {
    var op = atMatch[1];
    if (op == 'taglib') {
      var taglibPrefix = el.getAttribute('prefix');
      var taglibUri;
      if (el.hasAttribute('uri')) {
        taglibUri = el.getAttribute('uri');
      } else {
        taglibUri = el.getAttribute('tagdir');
      }
      scribe.taglibDeclaration(taglibPrefix + "", taglibUri + ""); // todo: test stringification
    } else if (op == 'include') {
      var includeFile = el.getAttribute('file') + ""; // todo: test stringification
      var url = JspScript.joinUrls(this.env_.baseUrl, this.currentUrl_, includeFile);
      var contents = this.env_.fetchFileContents(url);
      var dom = this.env_.createDomFromString(contents);
      this.walkNodes_(dom.childNodes, scribe);
    }
    return;
  }

  var nsMatch = JspScript.Template.RE_TAG.exec(el.tagName + ""); // todo: test stringification
  if (nsMatch) {
    var tagPrefix = nsMatch[1];
    var tagName = nsMatch[2];

    scribe.tagStart(tagPrefix, tagName, this.genAttributesCode_(el.attributes, scribe), this);
    if (hasChildren) {
      this.walkNodes_(el.childNodes, scribe);
    }
    scribe.tagEnd();

    return;
  }

  scribe.element(el.tagName + "", this.genAttributesCode_(el.attributes, scribe), hasChildren);
  if (hasChildren) {
    this.walkNodes_(el.childNodes, scribe);
    scribe.pop();
  }
}
