Jsp1Template = function(templateFile) {
  this.templateText_ = this.getFile_(templateFile);
  this.compiled_ = false;
}

Jsp1Template.ELEMENT_FINDER_ATTR = 'template:id';

Jsp1Template.prototype.compile_ = function() {
  var re = /((?:.|\n)*?)(<%=?|%>)/g;
  var escRe = /['\\]/g;
  var newlineRe = /\n/g;
  var match;
  var f = '';
  var op = '%>';
  var last = -1;
  while (match = re.exec(this.templateText_)) {
    switch (op) {
      case '%>':
        if (match[1].length == 0) break;
        f += '_(\'' + match[1].replace(escRe, '\\$1').replace(newlineRe, '\\n') + '\');\n';
        break;
      case '<%':
        f += match[1] + '\n';
        break;
      case '<%=':
        f += '_(' + match[1] + ');\n';
        break;
      default:
        throw new Error("unknown token " + op);
    }
//        console.log(op, match[1]);
    op = match[2];
    last = re.lastIndex;
  }
  if (last < this.templateText_.length) {
    f += '_(\'' + this.templateText_.substring(last).replace(escRe, '\\$1').replace(newlineRe, '\\n') + '\');\n'
  }
//    console.log(f);
  this.renderer_ = new Function("_", f);
}

Jsp1Template.prototype.render = function(map, dom) {
  if (!this.compiled_) {
    this.compile_();
  }

  var out = [];
  var writer = function(s) { out.push(s); };
  this.renderer_.call(map, writer);
  out = ''.concat.apply(null, out);

  var holder = document.createElement("div");
  holder.innerHTML = out;

  if (dom) {
    var allElems = holder.getElementsByTagName('*');
    for (var i = 0; i < allElems.length; i++) {
      var elem = allElems[i];
      var attrValue = elem.getAttribute(Jsp1Template.ELEMENT_FINDER_ATTR);
      if (attrValue != null) {
        if (dom[attrValue] instanceof Array) {
          dom[attrValue].push(elem);
        } else {
          dom[attrValue] = elem;
        }
        elem.removeAttribute(Jsp1Template.ELEMENT_FINDER_ATTR);
      }
    }
  }

  return holder;
}

Jsp1Template.prototype.getFile_ = function(url) {
  var xhrRequest;
  if (window.XMLHttpRequest) {
    xhrRequest = new XMLHttpRequest();
  } else {
    xhrRequest = new ActiveXObject("Microsoft.XMLHTTP");
  }
  if (xhrRequest) {
    xhrRequest.open("GET", url, false);
    xhrRequest.send(null);
    return xhrRequest.responseText;
  } else {
    return false;
  }
}
