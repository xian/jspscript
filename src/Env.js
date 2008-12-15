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

  var parsed = parser.parseFunctionBody(sourceDom.childNodes, url);
  generator.generateFunctionBody(parsed);

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
