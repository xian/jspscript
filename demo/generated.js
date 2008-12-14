// Generated file -- do not edit by hand!

JspScript.__GENERATED__ = {};
JspScript.__GENERATED__.uriToFnMap = {};

JspScript.Env.prototype.locateTemplate = function(uri) {
  return new JspScript.Template(JspScript.__GENERATED__.uriToFnMap[uri], this, uri);
};

JspScript.__GENERATED__.uriToFnMap['WEB-INF/jsp/attributes.jspf'] = function(attrs, tagContext) {
var top = [];
var stack = [];
var parent = { appendChild: function(e) { top.push(e); } };
var template = this;
function a() {
  var e = document.createElement(arguments[0]);
  for (var i = 1; i < arguments.length; i+=2) {
    e.setAttribute(arguments[i], arguments[i+1]);
  }
  parent.appendChild(e);
}
function q() {
  var e = document.createElement(arguments[0]);
  for (var i = 1; i < arguments.length; i+=2) {
    e.setAttribute(arguments[i], arguments[i+1]);
  }
  parent.appendChild(e);
  stack.push(parent);
  parent = e;
}
function z() {
  parent = stack.pop();
}
function w(t) {
  parent.appendChild(document.createTextNode(t));
}
function x(t) {
  parent.appendChild(t instanceof Node ? t : document.createTextNode(t));
}
function n(prefix, tag, tagAttrs, bodyFn) {
  var origTop = top; top = [];
  var origStack = stack; stack = [];
  var origParent = parent; parent = { appendChild: function(e) { top.push(e); } };
  var tagContext = new JspScript.TagContext(this, bodyFn, attrs);
  try {
    var results = template.doTag_(prefix, tag, tagAttrs, parent, tagContext);
    top = origTop;
    for (var i = 0; i < results.length; i++) origParent.appendChild(results[i]);
    var keepTop = top;
    return keepTop;
  } finally {
    top = origTop; stack = origStack; parent = origParent;
  }
}
function e(a) {
  for (var i = 0; i < a.length; i++) parent.appendChild(a[i]);
}
function g(t) {
  return attrs[t];
}
function f(prefix,name) {
  return template.findFunction_(prefix,name);
}
this.taglibPrefixes_['x'] = '/WEB-INF/tags/x';
w('\n');
this.taglibPrefixes_['xfns'] = 'http://jspscript.sourceforge.net/demo/xfns/1.0';
w('\n');
w('\n\nattr from outside ');
x(g('value'));
w(', ');
n('x','test', {tagValue:'also'}, function(g, tagContext) {
w('inside a tag body it ');
x(g('value'));
w(' ');
x(g('tagValue'));
w('!');
return top;
}, attrs);
w('\n');
return top;

}

JspScript.__GENERATED__.uriToFnMap['WEB-INF/jsp/declarations.jspf'] = function(attrs, tagContext) {
var top = [];
var stack = [];
var parent = { appendChild: function(e) { top.push(e); } };
var template = this;
function a() {
  var e = document.createElement(arguments[0]);
  for (var i = 1; i < arguments.length; i+=2) {
    e.setAttribute(arguments[i], arguments[i+1]);
  }
  parent.appendChild(e);
}
function q() {
  var e = document.createElement(arguments[0]);
  for (var i = 1; i < arguments.length; i+=2) {
    e.setAttribute(arguments[i], arguments[i+1]);
  }
  parent.appendChild(e);
  stack.push(parent);
  parent = e;
}
function z() {
  parent = stack.pop();
}
function w(t) {
  parent.appendChild(document.createTextNode(t));
}
function x(t) {
  parent.appendChild(t instanceof Node ? t : document.createTextNode(t));
}
function n(prefix, tag, tagAttrs, bodyFn) {
  var origTop = top; top = [];
  var origStack = stack; stack = [];
  var origParent = parent; parent = { appendChild: function(e) { top.push(e); } };
  var tagContext = new JspScript.TagContext(this, bodyFn, attrs);
  try {
    var results = template.doTag_(prefix, tag, tagAttrs, parent, tagContext);
    top = origTop;
    for (var i = 0; i < results.length; i++) origParent.appendChild(results[i]);
    var keepTop = top;
    return keepTop;
  } finally {
    top = origTop; stack = origStack; parent = origParent;
  }
}
function e(a) {
  for (var i = 0; i < a.length; i++) parent.appendChild(a[i]);
}
function g(t) {
  return attrs[t];
}
function f(prefix,name) {
  return template.findFunction_(prefix,name);
}
this.taglibPrefixes_['x'] = '/WEB-INF/tags/x';
w('\n');
this.taglibPrefixes_['xfns'] = 'http://jspscript.sourceforge.net/demo/xfns/1.0';
w('\n');
return top;

}

JspScript.__GENERATED__.uriToFnMap['WEB-INF/jsp/page.jsp'] = function(attrs, tagContext) {
var top = [];
var stack = [];
var parent = { appendChild: function(e) { top.push(e); } };
var template = this;
function a() {
  var e = document.createElement(arguments[0]);
  for (var i = 1; i < arguments.length; i+=2) {
    e.setAttribute(arguments[i], arguments[i+1]);
  }
  parent.appendChild(e);
}
function q() {
  var e = document.createElement(arguments[0]);
  for (var i = 1; i < arguments.length; i+=2) {
    e.setAttribute(arguments[i], arguments[i+1]);
  }
  parent.appendChild(e);
  stack.push(parent);
  parent = e;
}
function z() {
  parent = stack.pop();
}
function w(t) {
  parent.appendChild(document.createTextNode(t));
}
function x(t) {
  parent.appendChild(t instanceof Node ? t : document.createTextNode(t));
}
function n(prefix, tag, tagAttrs, bodyFn) {
  var origTop = top; top = [];
  var origStack = stack; stack = [];
  var origParent = parent; parent = { appendChild: function(e) { top.push(e); } };
  var tagContext = new JspScript.TagContext(this, bodyFn, attrs);
  try {
    var results = template.doTag_(prefix, tag, tagAttrs, parent, tagContext);
    top = origTop;
    for (var i = 0; i < results.length; i++) origParent.appendChild(results[i]);
    var keepTop = top;
    return keepTop;
  } finally {
    top = origTop; stack = origStack; parent = origParent;
  }
}
function e(a) {
  for (var i = 0; i < a.length; i++) parent.appendChild(a[i]);
}
function g(t) {
  return attrs[t];
}
function f(prefix,name) {
  return template.findFunction_(prefix,name);
}
w('\n');
this.taglibPrefixes_['x'] = '/WEB-INF/tags/x';
w('\n');
this.taglibPrefixes_['xfns'] = 'http://jspscript.sourceforge.net/demo/xfns/1.0';
w('\n');
w('\n');
q('html');
w('\n');
q('head');
w('\n  ');
q('title');
w('JSPscript Demo');
z();
w('\n  ');
q('style','type','text/css');
w('\n    .sample {\n      border: 1px solid black;\n      font-family: monospace;\n      font-size: 10px;\n      padding: 10px;\n    }\n\n    .output {\n      border: 1px solid black;\n      font-size: 12px;\n      padding: 10px;\n    }\n  ');
z();
w('\n');
z();
w('\n');
q('body');
w('\n\n');
q('h1');
w('JSPscript examples');
z();
w('\n\n');
q('div','class','example');
w('\n    ');
n('x','showFile', {fileName:'WEB-INF/jsp/attributes.jspf'}, function(g, tagContext) {
return top;
}, attrs);
w('\n    ');
n('x','showFile', {fileName:'WEB-INF/jsp/declarations.jspf'}, function(g, tagContext) {
return top;
}, attrs);
w('\n  ');
q('div','class','output');
w('\n    ');
this.doInclude_({page:'/WEB-INF/jsp/attributes.jspf'}.page, attrs, parent);
w('\n  ');
z();
w('\n');
z();
w('\n\n');
z();
w('\n');
z();
w('\n');
return top;

}

JspScript.__GENERATED__.uriToFnMap['WEB-INF/jsp/pageBindTest.jsp'] = function(attrs, tagContext) {
var top = [];
var stack = [];
var parent = { appendChild: function(e) { top.push(e); } };
var template = this;
function a() {
  var e = document.createElement(arguments[0]);
  for (var i = 1; i < arguments.length; i+=2) {
    e.setAttribute(arguments[i], arguments[i+1]);
  }
  parent.appendChild(e);
}
function q() {
  var e = document.createElement(arguments[0]);
  for (var i = 1; i < arguments.length; i+=2) {
    e.setAttribute(arguments[i], arguments[i+1]);
  }
  parent.appendChild(e);
  stack.push(parent);
  parent = e;
}
function z() {
  parent = stack.pop();
}
function w(t) {
  parent.appendChild(document.createTextNode(t));
}
function x(t) {
  parent.appendChild(t instanceof Node ? t : document.createTextNode(t));
}
function n(prefix, tag, tagAttrs, bodyFn) {
  var origTop = top; top = [];
  var origStack = stack; stack = [];
  var origParent = parent; parent = { appendChild: function(e) { top.push(e); } };
  var tagContext = new JspScript.TagContext(this, bodyFn, attrs);
  try {
    var results = template.doTag_(prefix, tag, tagAttrs, parent, tagContext);
    top = origTop;
    for (var i = 0; i < results.length; i++) origParent.appendChild(results[i]);
    var keepTop = top;
    return keepTop;
  } finally {
    top = origTop; stack = origStack; parent = origParent;
  }
}
function e(a) {
  for (var i = 0; i < a.length; i++) parent.appendChild(a[i]);
}
function g(t) {
  return attrs[t];
}
function f(prefix,name) {
  return template.findFunction_(prefix,name);
}
this.taglibPrefixes_['x'] = '/WEB-INF/tags/x';
w('\n');
q('html');
w('\n');
q('head');
w('\n  ');
q('title');
w('JSPscript Demo');
z();
w('\n  ');
q('style','type','text/css');
w('\n    .sample {\n      border: 1px solid black;\n      font-family: monospace;\n    }\n  ');
z();
w('\n');
z();
w('\n');
q('body');
w('\n\n');
q('h1');
w('JSPscript examples');
z();
w('\n\n');
q('div','class','example');
w('\n  ');
n('jspscript','bind', {onclick:'jkjkj'}, function(g, tagContext) {
w('\n    ');
q('button');
w('I\'m a button');
z();
w('\n  ');
return top;
}, attrs);
w('\n');
z();
w('\n\n');
z();
w('\n');
z();
w('\n');
return top;

}

JspScript.__GENERATED__.uriToFnMap['WEB-INF/tags/x/showFile.tag'] = function(attrs, tagContext) {
var top = [];
var stack = [];
var parent = { appendChild: function(e) { top.push(e); } };
var template = this;
function a() {
  var e = document.createElement(arguments[0]);
  for (var i = 1; i < arguments.length; i+=2) {
    e.setAttribute(arguments[i], arguments[i+1]);
  }
  parent.appendChild(e);
}
function q() {
  var e = document.createElement(arguments[0]);
  for (var i = 1; i < arguments.length; i+=2) {
    e.setAttribute(arguments[i], arguments[i+1]);
  }
  parent.appendChild(e);
  stack.push(parent);
  parent = e;
}
function z() {
  parent = stack.pop();
}
function w(t) {
  parent.appendChild(document.createTextNode(t));
}
function x(t) {
  parent.appendChild(t instanceof Node ? t : document.createTextNode(t));
}
function n(prefix, tag, tagAttrs, bodyFn) {
  var origTop = top; top = [];
  var origStack = stack; stack = [];
  var origParent = parent; parent = { appendChild: function(e) { top.push(e); } };
  var tagContext = new JspScript.TagContext(this, bodyFn, attrs);
  try {
    var results = template.doTag_(prefix, tag, tagAttrs, parent, tagContext);
    top = origTop;
    for (var i = 0; i < results.length; i++) origParent.appendChild(results[i]);
    var keepTop = top;
    return keepTop;
  } finally {
    top = origTop; stack = origStack; parent = origParent;
  }
}
function e(a) {
  for (var i = 0; i < a.length; i++) parent.appendChild(a[i]);
}
function g(t) {
  return attrs[t];
}
function f(prefix,name) {
  return template.findFunction_(prefix,name);
}
this.taglibPrefixes_['x'] = '/WEB-INF/tags/x';
w('\n');
this.taglibPrefixes_['xfns'] = 'http://jspscript.sourceforge.net/demo/xfns/1.0';
w('\n');
w('\n');
w('\n\n');
q('div','class','sample');
w('\n');
q('pre');
x(f('xfns','includeUrlText')(g('fileName')));
z();
w('\n');
z();
w('\n');
return top;

}

// taglib WEB-INF/tags/x
JspScript.__GENERATED__.uriToFnMap['WEB-INF/tags/x/test.tag'] = function(attrs, tagContext) {
var top = [];
var stack = [];
var parent = { appendChild: function(e) { top.push(e); } };
var template = this;
function a() {
  var e = document.createElement(arguments[0]);
  for (var i = 1; i < arguments.length; i+=2) {
    e.setAttribute(arguments[i], arguments[i+1]);
  }
  parent.appendChild(e);
}
function q() {
  var e = document.createElement(arguments[0]);
  for (var i = 1; i < arguments.length; i+=2) {
    e.setAttribute(arguments[i], arguments[i+1]);
  }
  parent.appendChild(e);
  stack.push(parent);
  parent = e;
}
function z() {
  parent = stack.pop();
}
function w(t) {
  parent.appendChild(document.createTextNode(t));
}
function x(t) {
  parent.appendChild(t instanceof Node ? t : document.createTextNode(t));
}
function n(prefix, tag, tagAttrs, bodyFn) {
  var origTop = top; top = [];
  var origStack = stack; stack = [];
  var origParent = parent; parent = { appendChild: function(e) { top.push(e); } };
  var tagContext = new JspScript.TagContext(this, bodyFn, attrs);
  try {
    var results = template.doTag_(prefix, tag, tagAttrs, parent, tagContext);
    top = origTop;
    for (var i = 0; i < results.length; i++) origParent.appendChild(results[i]);
    var keepTop = top;
    return keepTop;
  } finally {
    top = origTop; stack = origStack; parent = origParent;
  }
}
function e(a) {
  for (var i = 0; i < a.length; i++) parent.appendChild(a[i]);
}
function g(t) {
  return attrs[t];
}
function f(prefix,name) {
  return template.findFunction_(prefix,name);
}
w('\n\ntest tag: before\n');
e(tagContext.renderBody(null, attrs));
w('\ntest tag: after\n');
return top;

}

// taglib WEB-INF/tags/x
