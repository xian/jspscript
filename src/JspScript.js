if (null) {
  var console = { log: null, dirxml: null };
}

var JspScript = {}, AttrMap;

JspScript.Env = function(domParserFunction) {
  this.domParserFunction = domParserFunction || function(text) {
    return new DOMParser().parseFromString(text, 'application/xml');
  }
  this.taglibs_ = {};
};

JspScript.Env.JSP_TAGS = {
  doBody: function(name, jspTagAttrs, parent, attrs, tagContext) {
    tagContext.renderBody(parent, attrs);
    console.log('after dobody, parent is', parent);
//    console.dirxml(parent);
  }
};

JspScript.Env.prototype.createTemplateFromUrl = function(url) {
  var xhrRequest;
  if (window.XMLHttpRequest) {
    xhrRequest = new XMLHttpRequest();
  } else {
    xhrRequest = new ActiveXObject("Microsoft.XMLHTTP");
  }
  if (!xhrRequest) {
    throw new Error("can't create XHR");
  }

  xhrRequest.open("GET", url, false);
  xhrRequest.send(null);
  return this.createTemplateFromString(xhrRequest.responseText);
};

JspScript.Env.prototype.createTemplateFromString = function(string) {
  var sourceDom = this.createDomFromString(string);
  return this.createTemplateFromDom(sourceDom);
};

JspScript.Env.prototype.createTemplateFromDom = function(sourceDom) {
  var generator = new JspScript.Generator(this);
  var scribe = new JspScript.Scribe();
  generator.generateFunctionBody(sourceDom.childNodes, scribe);
  var fn = new Function('attrs', 'tagContext', scribe.getScript());
  return new JspScript.Template(fn, this);
}

JspScript.Env.prototype.createDomFromString = function(string) {
  var text =
      '<__t2__>' +
      string
          .replace(/<%@\s*/g, '<__t2at__')
          .replace(/%>/g, '/>')
          .replace(/<(\/)?(\w+):/g, '<$1__t2_$2__') +
      '</__t2__>';
  console.log(string, '--->', text);
  var sourceDom = this.domParserFunction(text);

  if (sourceDom.childNodes.length != 1 || sourceDom.firstChild.tagName != '__t2__') {
    throw new Error('malformed source DOM');
  }
  return sourceDom.firstChild;
}


JspScript.Env.prototype.registerTaglib = function(url, taglib) {
  this.taglibs_[url] = taglib;
};

JspScript.Env.prototype.getTagTemplate = function(url, tagName) {
  var taglib = this.taglibs_[url];
  if (!taglib) {
    throw new Error('unknown taglib "' + url + '"');
  }
  var tagTemplate = taglib[tagName];
  if (!tagTemplate) {
    throw new Error('unknown or unsupported tag <' + url + ':' + name + '/>');
  }
  return tagTemplate;
};

JspScript.Env.RE_START_SYMBOL_CHAR = /[a-zA-Z_$]/;
JspScript.Env.RE_SYMBOL_CHAR = /[a-zA-Z0-9_$:]/;
JspScript.Env.RE_CARRYON_CHAR = /[.a-zA-Z0-9_$]/;

JspScript.Env.prototype.translateExpression = function(expression) {
  var out = '';
  var state = 0;
  for (var c = 0; c < expression.length; c++) {
    var cur = expression[c];
    var until = '';

//    console.log(state, cur, out);

    switch (state) {
      case 0: // outside of symbol
        if (cur.match(JspScript.Env.RE_START_SYMBOL_CHAR)) {
          out += 'g(\'';
          state = 1;
        } else if (cur == '"' || cur == '\'') {
          until = cur;
          state = 4;
        }
        break;

      case 1: // inside of dereferenced symbol
        if (!cur.match(JspScript.Env.RE_SYMBOL_CHAR)) {
          out += '\')';

          if (cur == '.') {
            state = 2;
          } else {
            state = 0;
          }
        }
        break;

      case 2: // after dereferenced or literal symbol
        if (!cur.match(JspScript.Env.RE_SYMBOL_CHAR)) {
          if (cur == '[') {
            state = 0;
          } else {
            state = 3;
          }
        }
        break;

      case 3:
        if (!cur.match(JspScript.Env.RE_SYMBOL_CHAR)) {
          state = 0;
        }
        break;

      case 4: // inside quoted literal
        if (cur == '\\') {
          state = 5;
        } else if (cur == until) {
          state = 0;
        }
        break;

      case 5: // escaped char inside quoted literal
        state = 4;
        break;
    }

    out += cur;
  }

  if (state == 1) {
    out += '\')';
  }

  return out;
};

JspScript.Env.prototype.compileExpression = function(expression) {
  var translatedExpression = this.translateExpression(expression);
  return new Function('g', 'return (' + translatedExpression + ')');
};


JspScript.TagContext = function(template, bodyFunction, attrs) {
  this.template = template;
  this.bodyFunction = bodyFunction;
  this.attrs = attrs;
};

JspScript.TagContext.prototype.renderBody = function(parent, extraAttrs) {
  console.log('renderBody');
  console.dir(this);
//  for (var index = 0; index < this.childNodes.length; index++) {
//    console.log('renderBody walk', this.childNodes[index], parent, extraAttrs);
//    this.template.walk_(this.childNodes[index], parent, [extraAttrs, this.attrs], null);
//  }
  var attrs = this.attrs;
  if (attrs == null) throw new Error("attrs was null");

  var g = function(t) {
    return t in extraAttrs ? extraAttrs[t] : attrs[t];
  };
  var output = this.bodyFunction(g, this);
  var newOutput = new Array(output.length);
  for (var i = 0; i < output.length; i++) {
    newOutput[i] = output[i];
  }
  output.length = 0;
  console.log('renderBody output:', newOutput);
  return newOutput;
};


JspScript.Template = function(templateFunction, env) {
  this.templateFunction = templateFunction;
  this.env_ = env;
  this.compiled_ = false;
  this.taglibPrefixes_ = { };
};

JspScript.Template.RE_EL = /\${([^}]+)}/g;
JspScript.Template.RE_TAG = /__t2_(.*)__(.*)/;
JspScript.Template.RE_TAG_AT = /__t2at__(.*)/;

JspScript.Template.prototype.render = function(attrs) {
//  console.log("function:", this.templateFunction.toString(), attrs);
  return this.templateFunction(attrs);
//  var root = document.createElement('div');
//  this.renderTag_(attrs, root, null);
//  return root.childNodes;
}

JspScript.Template.prototype.renderTag_ = function(attrs, parent, tagContext) {
//  if (!this.compiled_) {
//    this.compile_();
//  }
//  console.log(this.templateXml_);

//  var nodes = this.templateXml_;
//  for (var i = 0; i < nodes.length; i++) {
//    this.walk_(nodes[i], parent, attrs, tagContext);
//  }

//  tagCon.call(this, );

  console.log("renderTag", tagContext, this.templateFunction);
//  return this.templateFunction(attrs, tagContext);
  var output = this.templateFunction(attrs, tagContext);
  console.log('renderTag output:', output);
  return output;
};

JspScript.Template.prototype.walk_ = function(el, parent, attrs, tagContext) {
  //noinspection JSUnresolvedVariable
  switch (el.nodeType) {
    case Node.TEXT_NODE:
      this.handleTextNode_(el, parent, attrs);
      break;

    case Node.ELEMENT_NODE:
      this.handleElement_(el, parent, attrs, tagContext);
      break;
  }
};

JspScript.Template.prototype.handleTextNode_ = function(el, parent, attrs) {
  JspScript.Template.RE_EL.lastIndex = 0;
  console.log('handleTextNode', el, parent, attrs);
  var current = '';

  var text = el.nodeValue;
  var start = 0;
  var match;
  while ((match = JspScript.Template.RE_EL.exec(text))) {
//    console.log('match', match);
    if (start < match.index) {
      current += text.substring(start, match.index);
      start = match.index;
    }

    var result = this.eval_(match[1], attrs);

    console.log('result', result);
    if (result instanceof Node) {
      if (current) {
        parent.appendChild(this.createTextNode_(current));
        current = '';
      }
      parent.appendChild(result);
    } else {
      current += result;
    }

    start = JspScript.Template.RE_EL.lastIndex;
  }

  if (start < text.length) {
    current += text.substring(start);
  }

  if (current) {
    parent.appendChild(this.createTextNode_(current));
  }
  console.dirxml(parent);
};

JspScript.Template.prototype.doJspTag_ = function(name, jspTagAttrs, parent, attrs, tagContext) {
  var handlerFn = JspScript.Env.JSP_TAGS[name];
  if (!handlerFn) {
    throw new Error('unknown or unsupported tag <jsp:' + name + '/>');
  }
  handlerFn(name, jspTagAttrs, parent, attrs, tagContext, this);
}

JspScript.Template.prototype.doTag_ = function(prefix, name, jspTagAttrs, parent, tagContext) {
  var taglibUrl = this.taglibPrefixes_[prefix];
  if (!taglibUrl) {
    throw new Error('unknown taglib prefix "' + prefix + '"');
  }
  //    console.log(nsMatch, taglibUrl, tagName);
  var tagTemplate = this.env_.getTagTemplate(taglibUrl, name);

  console.log("tagTemplate.renderTag_", jspTagAttrs, parent, tagContext);
  var contents = tagTemplate.renderTag_(jspTagAttrs, parent, tagContext);
  console.log("tagTemplate.renderTag_ returns:", contents);
  return contents;
}

JspScript.Template.prototype.handleElement_ = function(el, parent, attrs, tagContext) {
  var atMatch = JspScript.Template.RE_TAG_AT.exec(el.tagName);
  if (atMatch) {
    var op = atMatch[1];
    if (op == 'taglib') {
      var taglibPrefix = el.getAttribute('prefix');
      var taglibUri = el.getAttribute('uri');
//      console.log('set', taglibPrefix, taglibUri);
      this.taglibPrefixes_[taglibPrefix] = taglibUri;
    }
//    console.log('@@@', el, atMatch);
    return;
  }

  var nsMatch = JspScript.Template.RE_TAG.exec(el.tagName);
  if (nsMatch) {
//    console.log('ns', el, nsMatch[1], nsMatch[2]);

    var tagPrefix = nsMatch[1];
    var tagName = nsMatch[2];
    if (tagPrefix == 'jsp') {
      this.doJspTag_(tagName, el.attributes, parent, attrs, tagContext);
      return;
    }

    var taglibUrl = this.taglibPrefixes_[tagPrefix];
    if (!taglibUrl) {
      throw new Error('unknown taglib prefix "' + tagPrefix + '"');
    }
//    console.log(nsMatch, taglibUrl, tagName);
    var tagTemplate = this.env_.getTagTemplate(taglibUrl, tagName);

    var subTagAttrs = {};
    for (var subTagAttrIndex = 0; subTagAttrIndex < el.attributes.length; subTagAttrIndex++) {
      var subTagAttr = el.attributes[subTagAttrIndex];
      subTagAttrs[subTagAttr.name] = this.evalAttr_(subTagAttr.value, attrs);
    }

    tagTemplate.renderTag_(subTagAttrs, parent, new JspScript.TagContext(this, el.childNodes, attrs));
    return;
  }

  var outEl = this.createElement_(el.tagName);
  for (var elAttrIndex = 0; elAttrIndex < el.attributes.length; elAttrIndex++) {
    var elAttr = el.attributes[elAttrIndex];
    outEl.setAttribute(elAttr.name, this.evalAttr_(elAttr.value, attrs));
  }

  parent.appendChild(outEl);

  for (var childIndex = 0; childIndex < el.childNodes.length; childIndex++) {
    this.walk_(el.childNodes[childIndex], outEl, attrs, tagContext);
  }
};

JspScript.Template.prototype.evalAttr_ = function(origValue, attrs) {
  JspScript.Template.RE_EL.lastIndex = 0;

  var start = 0;
  var match;
  var value = [];
  while ((match = JspScript.Template.RE_EL.exec(origValue))) {
    if (start < match.index) {
      value.push(origValue.substring(start, match.index));
      start = match.index;
    }

    value.push(this.eval_(match[1], attrs));

    start = JspScript.Template.RE_EL.lastIndex;
  }

  if (start < origValue.length) {
    value.push(origValue.substring(start));
  }
  return value.length == 1 ? value[0] : value.join('');
}

JspScript.Template.prototype.eval_ = function(expr, attrs) {
  var fn = this.env_.compileExpression(expr);

  var getAttr = function(name) {
    if (attrs instanceof Array) {
      for (var i = 0; i < attrs.length; i++) {
        if (name in attrs[i]) return attrs[i][name];
      }
      return null;
    } else {
      return attrs[name];
    }
  };

  return fn(getAttr);
};

JspScript.Template.prototype.createElement_ = function(tagName) {
  return document.createElement(tagName);
};

JspScript.Template.prototype.createTextNode_ = function(value) {
  return document.createTextNode(value);
};

//AttrMap = function(values, parent) {
//  this.values_ = values;
//  if (parent == null) {
//    this.parent_ = { get: function() { return undefined; } };
//  } else {
//    this.parent_ = parent;
//  }
//};
//
//AttrMap.prototype.get = function(name) {
//  var value = this.values[name];
//  return value === undefined ? this.parent_.get(name) : value;
//};

/**
 * Create a new Document object. If no arguments are specified,
 * the document will be empty. If a root tag is specified, the document
 * will contain that single root tag. If the root tag has a namespace
 * prefix, the second argument must specify the URL that identifies the
 * namespace.
 */
XML.newDocument = function(rootTagName, namespaceURL) {
  if (!rootTagName) rootTagName = "";
  if (!namespaceURL) namespaceURL = "";
  if (document.implementation && document.implementation.createDocument) {
    // This is the W3C standard way to do it
    return document.implementation.createDocument(namespaceURL, rootTagName, null);
  }
  else { // This is the IE way to do it
    // Create an empty document as an ActiveX object
    // If there is no root element, this is all we have to do
    var doc = new ActiveXObject("MSXML2.DOMDocument");
    // If there is a root tag, initialize the document
    if (rootTagName) {
      // Look for a namespace prefix
      var prefix = "";
      var tagname = rootTagName;
      var p = rootTagName.indexOf(':');
      if (p != -1) {
        prefix = rootTagName.substring(0, p);
        tagname = rootTagName.substring(p+1);
      }
      // If we have a namespace, we must have a namespace prefix
      // If we don't have a namespace, we discard any prefix
      if (namespaceURL) {
        if (!prefix) prefix = "a0"; // What Firefox uses
      }
      else prefix = "";
      // Create the root element (with optional namespace) as a
      // string of text
      var text = "<" + (prefix?(prefix+":"):"") +  tagname +
          (namespaceURL
           ?(" xmlns:" + prefix + '="' + namespaceURL +'"')
           :"") +
          "/>";
      // And parse that text into the empty document
      doc.loadXML(text);
    }
    return doc;
  }
};

/**
 * Synchronously load the XML document at the specified URL and
 * return it as a Document object
 */
XML.load = function(url) {
    // Create a new document with the previously defined function
    var xmldoc = XML.newDocument();
    xmldoc.async = false;  // We want to load synchronously
    xmldoc.load(url);      // Load and parse
    return xmldoc;         // Return the document
};
