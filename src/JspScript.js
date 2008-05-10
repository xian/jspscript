var JspScript = {};


JspScript.joinUrls = function(rootUrl, baseUrl, url) {
  var base = baseUrl;

  var urlParts = url.split(/\/+/);
  if (urlParts[0] == '') {
    base = rootUrl;
    if (base != '.') base += '/.';
    urlParts = urlParts.splice(1);
  }

  var outputUrlParts = base.split(/\/+/);
  outputUrlParts.length--;

  for (var i = 0; i < urlParts.length; i++) {
    var urlPart = urlParts[i];
    if (urlPart == '.') {
      // skip
    } else if (urlPart == '..') {
      if (outputUrlParts.length) outputUrlParts.length--;
    } else {
      outputUrlParts.push(urlPart);
    }
  }

  return outputUrlParts.join('/');
}


JspScript.Env = function(opt_baseUrl, opt_domParserFunction) {
  this.baseUrl = opt_baseUrl || '.';
  this.domParserFunction = opt_domParserFunction || function(text) {
    return new DOMParser().parseFromString(text, 'application/xml');
  }
  this.taglibs_ = {};
  this.urlCache_ = {};

  this.settings = {};
  this.settings.loadResourcesDynamically = false;
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

JspScript.Env.prototype.createXhr_ = function() {
  var xhrRequest;
  if (window.XMLHttpRequest) {
    xhrRequest = new XMLHttpRequest();
  } else {
    xhrRequest = new ActiveXObject("Microsoft.XMLHTTP");
  }
  if (!xhrRequest) {
    throw new Error("can't create XHR");
  }
  return xhrRequest;
};

JspScript.Env.prototype.clearUrlCache = function() {
  this.urlCache_ = {};
};

JspScript.Env.prototype.fetchFileContents = function(url) {
  var contents = this.urlCache_[url];

  if (contents == null) {
    var xhrRequest = this.createXhr_();
    xhrRequest.open("GET", url, false);
    xhrRequest.send(null);
    contents = xhrRequest.responseText;
    this.urlCache_[url] = contents;
  }

  return contents;
};

JspScript.Env.prototype.createTemplateFromUrl = function(url) {
  var contents = this.fetchFileContents(url);
  return this.createTemplateFromString(contents, url);
};

JspScript.Env.prototype.createTemplateFromString = function(string, opt_url) {
  var sourceDom = this.createDomFromString(string);
  return this.createTemplateFromDom(sourceDom, opt_url || null);
};

JspScript.Env.prototype.createTemplateFromDom = function(sourceDom, url) {
  var parser = new JspScript.Parser(this);
  var generator = new JspScript.Generator();
  parser.parseFunctionBody(sourceDom.childNodes, generator, url);
  var fn = new Function('attrs', 'tagContext', generator.getScript());
  return new JspScript.Template(fn, this, url);
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
    if (this.settings.loadResourcesDynamically) {
      tagLib = new JspScript.DevTagLib(this, url);
      this.taglibs_[url] = tagLib;
    } else {
      throw new Error('unknown taglib "' + url + '"');
    }
  }
  return tagLib;
};

JspScript.Env.prototype.getTagTemplate = function(url, tagName) {
  var tagLib = this.getTaglib_(url);
  var tag = tagLib.getTag(tagName);
  if (!tag) {
    throw new Error('unknown or unsupported tag <' + url + ':' + tagName + '/>');
  }
  return tag;
};

JspScript.Env.prototype.getTaglibFunction = function(url, functionName) {
  var tagLib = this.getTaglib_(url);
  var fn = tagLib.getFunction(functionName);
  if (!fn) {
    throw new Error('unknown or unsupported function <' + url + ':' + functionName + '/>');
  }
  return fn;
};

JspScript.Env.RE_START_SYMBOL_CHAR = /[a-zA-Z_$]/;
JspScript.Env.RE_SYMBOL_CHAR = /[a-zA-Z0-9_$]/;
JspScript.Env.RE_CARRYON_CHAR = /[.a-zA-Z0-9_$]/;

// todo: move to Parser.js
ElGenerator = function() {
  this.out_ = '';
};
ElGenerator.prototype.getScript = function() {
  return this.out_;
};
ElGenerator.prototype.startSymbolLookup = function() {
  this.gChar_ = this.out_.length;
  this.out_ += 'g(\'';
};
ElGenerator.prototype.emitSymbol = function(symbol) {
  this.out_ += symbol;
};
ElGenerator.prototype.endSymbolLookup = function() {
  this.out_ += '\')';
};
ElGenerator.prototype.lookupCurrentSymbolAsFunction = function() {
  this.out_ = this.out_.substring(0, this.gChar_) + 'f' + this.out_.substring(this.gChar_ + 1);
};

JspScript.Env.prototype.translateExpression = function(expression) {
  var generator = new ElGenerator();

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
};

JspScript.TagLib.prototype.getTag = function(name) {
  return this.tags_[name];
};

JspScript.TagLib.prototype.getFunction = function(name) {
  return this.functions_[name];
};


JspScript.DevTagLib = function(env, url) {
  this.env_ = env;
  this.url_ = url;
};

JspScript.DevTagLib.prototype.getTag = function(name) {
  var templateFile = this.env_.baseUrl + '/' + this.url_ + '/' + name + '.tag';
  return this.env_.locateTemplate(templateFile);
};

JspScript.DevTagLib.prototype.getFunction = function(name) {
  throw new Error("functions not supported here yet...");
};


JspScript.Template = function(templateFunction, env, url) {
  this.templateFunction = templateFunction;
  this.env_ = env;
  this.url_ = url;
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
  return this.templateFunction(attrs, tagContext);
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
  var tagTemplate = this.env_.getTagTemplate(taglibUrl, name);
  return tagTemplate.renderTag_(jspTagAttrs, parent, tagContext);
}

JspScript.Template.prototype.doInclude_ = function(uri, attrs, parent) {
  uri = this.getUrl(uri);
  this.env_.render(uri, attrs, parent);
}


JspScript.Template.prototype.findFunction_ = function(prefix, name) {
  var taglibUrl = this.taglibPrefixes_[prefix];
  if (!taglibUrl) {
    throw new Error('unknown taglib prefix "' + prefix + '"');
  }
  return this.env_.getTaglibFunction(taglibUrl, name);
}


JspScript.Template.prototype.createElement_ = function(tagName) {
  return document.createElement(tagName);
};

JspScript.Template.prototype.createTextNode_ = function(value) {
  return document.createTextNode(value);
};

JspScript.Template.prototype.getUrl = function(url) {
  return JspScript.joinUrls(this.env_.baseUrl, this.url_, url);
};
