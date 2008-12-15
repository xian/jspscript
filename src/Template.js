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
