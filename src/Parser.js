JspScript.Parser = function(env) {
  this.env_ = env;
  this.currentUrl_ = null;
}

JspScript.Parser.prototype.parseFunctionBody = function(nodes, generator, url) {
  var previousUrl = this.currentUrl_;
  this.currentUrl_ = url || null;
  try {
    generator.prolog();
    this.walkNodes_(nodes, generator);
    generator.epilog();
  } finally {
    this.currentUrl_ = previousUrl;
  }
};

JspScript.Parser.prototype.walkNodes_ = function(nodes, generator) {
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes.item(i);
    //noinspection JSUnresolvedVariable
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        this.genTextCode_(node.nodeValue + "", generator);
        break;

      case Node.ELEMENT_NODE:
        this.genElementCode_(node, generator);
        break;
    }
  }
}

JspScript.Parser.prototype.genAttributesCode_ = function(attributes) {
  var attrsOut = [];
  var needPlus = false;
  var out = '';

  var attrGenerator = {
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
    this.genTextCode_(attribute.value + "", attrGenerator);

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

JspScript.Parser.prototype.genTextCode_ = function(text, generator) {
  JspScript.Template.RE_EL.lastIndex = 0;

  var start = 0;
  var match;
  while ((match = JspScript.Template.RE_EL.exec(text))) {
    if (start < match.index) {
      generator.text(text.substring(start, match.index));
      start = match.index;
    }

    if (match[0][0] == '\\') { // escaped expression: \${xxx}
      generator.text(match[0].substring(1));
    } else {
      var expr = this.translateExpression(match[1]);
      generator.expression(expr);
    }

    start = JspScript.Template.RE_EL.lastIndex;
  }

  if (start < text.length) {
    generator.text(text.substring(start));
  }
};


JspScript.Parser.prototype.genElementCode_ = function(el, generator) {
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
      generator.taglibDeclaration(taglibPrefix + "", taglibUri + ""); // todo: test stringification
    } else if (op == 'include') {
      var includeFile = el.getAttribute('file') + ""; // todo: test stringification
      var url = JspScript.joinUrls(this.env_.baseUrl, this.currentUrl_, includeFile);
      var contents = this.env_.fetchFileContents(url);
      var dom = this.env_.createDomFromString(contents);
      this.walkNodes_(dom.childNodes, generator);
    }
    return;
  }

  var nsMatch = JspScript.Template.RE_TAG.exec(el.tagName + ""); // todo: test stringification
  if (nsMatch) {
    var tagPrefix = nsMatch[1];
    var tagName = nsMatch[2];

    generator.tagStart(tagPrefix, tagName, this.genAttributesCode_(el.attributes, generator), this);
    if (hasChildren) {
      this.walkNodes_(el.childNodes, generator);
    }
    generator.tagEnd();

    return;
  }

  generator.element(el.tagName + "", this.genAttributesCode_(el.attributes, generator), hasChildren);
  if (hasChildren) {
    this.walkNodes_(el.childNodes, generator);
    generator.pop();
  }
};

JspScript.Parser.prototype.translateExpression = function(expression) {
  var generator = new JspScript.ElGenerator();

  var state = 0;
  var until = '';

  for (var i = 0; i < expression.length; i++) {
    var c = expression[i];

//    console.log('tX', state, c, out, until == '' ? '' : 'until==' + until);

    switch (state) {
      case 0: // outside of symbol
        if (c.match(JspScript.Env.RE_START_SYMBOL_CHAR)) {
          generator.startSymbolLookup();
          state = 1;
        } else if (c == '"' || c == '\'') {
          until = c;
          state = 4;
        }
        break;

      case 1: // inside of dereferenced symbol
        if (!c.match(JspScript.Env.RE_SYMBOL_CHAR)) {

          if (c == '.') {
            generator.endSymbolLookup();
            state = 2;
          } else if (c == ':') {
            // ugly...
            generator.lookupCurrentSymbolAsFunction();
            c = '\',\'';
          } else {
            generator.endSymbolLookup();
            state = 0;
          }
        }
        break;

      case 2: // after dereferenced or literal symbol
        if (!c.match(JspScript.Env.RE_SYMBOL_CHAR)) {
          if (c == '[') {
            state = 0;
          } else {
            state = 3;
          }
        }
        break;

      case 3:
        if (!c.match(JspScript.Env.RE_SYMBOL_CHAR)) {
          state = 0;
        }
        break;

      case 4: // inside quoted literal
        if (c == '\\') {
          state = 5;
        } else if (c == until) {
          state = 0;
        }
        break;

      case 5: // escaped char inside quoted literal
        state = 4;
        break;
    }

    generator.emitSymbol(c);
  }

  if (state == 1) {
    generator.endSymbolLookup();
  }

//  console.log('tX', out);

  return generator.getScript();
};

