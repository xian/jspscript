
function assertText(expectedText, actualNodes) {
  var actual = '';
  for (var i = 0; i < actualNodes.length; i++) {
    var node = actualNodes[i];
    actual += domToString(node);
  }
  assertEquals(expectedText, actual);
}

function domToString(node) {
  var out = '';
  if (node.nodeType == Node.ELEMENT_NODE) {
    out += '[DOM: <' + node.tagName.toLowerCase();
    for (var j = 0; j < node.attributes.length; j++) {
      var attribute = node.attributes.item(j);
      out += ' ' + attribute.name + '="' + attribute.value + '"';
    }
    if (node.childNodes.length == 0) {
      out += '/>]';
    } else {
      out += '>';
      for (var k = 0; k < node.childNodes.length; k++) {
        out += domToString(node.childNodes.item(k));
      }
      out += '</' + node.tagName.toLowerCase() + '>]';
    }
  } else if (node.nodeType == Node.TEXT_NODE) {
    out += node.nodeValue;
  }
  return out;
}

function assertNodes(expected, actualNodes) {
  var actual = [];
  for (var i = 0; i < actualNodes.length; i++) {
    var node = actualNodes[i];
    if (node.nodeType == Node.ELEMENT_NODE) {
      actual.push('<' + node.tagName + '>');
    } else if (node.nodeType == Node.TEXT_NODE) {
      actual.push(node.nodeValue);
    }
  }
  if (expected.length != actual.length) {
    fail('expected ' + expected + ' but found ' + actual);
  }
  assertArrayEquals(expected, actual);
}

function assertChildren(expectedNodes, element) {
  assertNodes(expectedNodes, element.childNodes);
}

var SpyControl = function() {
  this.log_ = [];
}

SpyControl.prototype.getLog = function() {
  return this.log_;
}

SpyControl.prototype.createSpy = function(baseClass, spyName, returnValues) {
  var spyControl = this;

  var createSpyMethod = function(methodName) {
    return function() {
      var call = [spyName, methodName];
      for (var i = 0; i < arguments.length; i++) {
        call.push(arguments[i]);
      }
      spyControl.log_.push(call);
      var returnFn = returnValues[methodName];
      return returnFn ? returnFn.apply(this, arguments) : undefined;
    }
  };

  var spyClass = function() { };
  for (var methodName in baseClass.prototype) {
    spyClass.prototype[methodName] = createSpyMethod(methodName);
  }
  return new spyClass();
};
