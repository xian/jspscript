JspScript.Parser = function(env) {
  this.env_ = env;
  this.currentUrl_ = null;
}

JspScript.Parser.prototype.parseFunctionBody = function(nodes, scribe, url) {
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

JspScript.Parser.prototype.walkNodes_ = function(nodes, scribe) {
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

JspScript.Parser.prototype.genAttributesCode_ = function(attributes) {
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

JspScript.Parser.prototype.genTextCode_ = function(text, scribe) {
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


JspScript.Parser.prototype.genElementCode_ = function(el, scribe) {
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
