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
};

JspScript.inherit = function(subClass, superClass) {
  var x = function() {};
  x.prototype = superClass.prototype;
  subClass.prototype = new x();
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

