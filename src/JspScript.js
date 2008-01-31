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
  }
};

JspScript.Env.prototype.locateTemplate = function(uri) {
  return this.createTemplateFromUrl(uri);
};

JspScript.Env.prototype.render = function(uri, attrs, parentNode) {
  var template = this.locateTemplate(uri);
  var result = template.render(attrs);
  for (var i = 0; i < result.length; i++) {
    parentNode.appendChild(result[i]);
  }
}

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
//  console.log(string, '--->', text);
  var sourceDom = this.domParserFunction(text);

  if (sourceDom.childNodes.length != 1 || sourceDom.firstChild.tagName != '__t2__') {
    throw new Error('malformed source DOM');
  }
  return sourceDom.firstChild;
}

JspScript.Env.prototype.registerTaglib = function(url, tagLib) {
  this.taglibs_[url] = tagLib;
};

JspScript.Env.prototype.getTaglib_ = function(url) {
  var tagLib = this.taglibs_[url];
  if (!tagLib) {
    throw new Error('unknown taglib "' + url + '"');
  }
  return tagLib;
};

JspScript.Env.prototype.getTagTemplate = function(url, tagName) {
  var tagLib = this.getTaglib_(url);
  var tag = tagLib.getTag(tagName);
  if (!tag) {
    throw new Error('unknown or unsupported tag <' + url + ':' + name + '/>');
  }
  return tag;
};

JspScript.Env.prototype.getTaglibFunction = function(url, functionName) {
  var tagLib = this.getTaglib_(url);
  var fn = tagLib.getFunction(functionName);
  if (!fn) {
    throw new Error('unknown or unsupported function <' + url + ':' + name + '/>');
  }
  return fn;
};

JspScript.Env.RE_START_SYMBOL_CHAR = /[a-zA-Z_$]/;
JspScript.Env.RE_SYMBOL_CHAR = /[a-zA-Z0-9_$]/;
JspScript.Env.RE_CARRYON_CHAR = /[.a-zA-Z0-9_$]/;

JspScript.Env.prototype.translateExpression = function(expression) {
  var out = '';
  var gChar;

  var state = 0;
  var until = '';

  for (var i = 0; i < expression.length; i++) {
    var c = expression[i];

//    console.log('tX', state, c, out, until == '' ? '' : 'until==' + until);

    switch (state) {
      case 0: // outside of symbol
        if (c.match(JspScript.Env.RE_START_SYMBOL_CHAR)) {
          gChar = out.length;
          out += 'g(\'';
          state = 1;
        } else if (c == '"' || c == '\'') {
          until = c;
          state = 4;
        }
        break;

      case 1: // inside of dereferenced symbol
        if (!c.match(JspScript.Env.RE_SYMBOL_CHAR)) {

          if (c == '.') {
            out += '\')';
            state = 2;
          } else if (c == ':') {
            // ugly...
            out = out.substring(0, gChar) + 'f' + out.substring(gChar + 1);
            c = '\',\'';
          } else {
            out += '\')';
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

    out += c;
  }

  if (state == 1) {
    out += '\')';
  }

//  console.log('tX', out);

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
  return newOutput;
};


JspScript.TagLib = function(opt_tags, opt_functions) {
  this.tags_ = opt_tags || {};
  this.functions_ = opt_functions || {};
}

JspScript.TagLib.prototype.getTag = function(name) {
  return this.tags_[name];
}

JspScript.TagLib.prototype.getFunction = function(name) {
  return this.functions_[name];
}


JspScript.Template = function(templateFunction, env) {
  this.templateFunction = templateFunction;
  this.env_ = env;
  this.compiled_ = false;
  this.taglibPrefixes_ = { };
};

JspScript.Template.RE_EL = /\\?\${([^}]+)}/g;
JspScript.Template.RE_TAG = /__t2_(.*)__(.*)/;
JspScript.Template.RE_TAG_AT = /__t2at__(.*)/;

JspScript.Template.prototype.render = function(attrs) {
  return this.templateFunction(attrs);
}

JspScript.Template.prototype.renderTag_ = function(attrs, parent, tagContext) {
  var output = this.templateFunction(attrs, tagContext);
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

//  console.log("tagTemplate.renderTag_", jspTagAttrs, parent, tagContext);
  var contents = tagTemplate.renderTag_(jspTagAttrs, parent, tagContext);
//  console.log("tagTemplate.renderTag_ returns:", contents);
  return contents;
}


JspScript.Template.prototype.findFunction_ = function(prefix, name) {
  var taglibUrl = this.taglibPrefixes_[prefix];
  if (!taglibUrl) {
    throw new Error('unknown taglib prefix "' + prefix + '"');
  }
  return this.env_.getTaglibFunction(taglibUrl, name);
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
