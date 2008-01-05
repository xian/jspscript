
function assertText(expectedText, actualNodes) {
  var actual = '';
  for (var i = 0; i < actualNodes.length; i++) {
    var node = actualNodes[i];
    if (node.nodeType == Node.ELEMENT_NODE) {
      actual += '[DOM: <' + node.tagName + '>]';
    } else if (node.nodeType == Node.TEXT_NODE) {
      actual += node.nodeValue;
    }
  }
  assertEquals(expectedText, actual);
}

function assertNodes(expected, actualNodes) {
  console.log(actualNodes);
  var actual = [];
  for (var i = 0; i < actualNodes.length; i++) {
    var node = actualNodes[i];
    if (node.nodeType == Node.ELEMENT_NODE) {
      actual.push('<' + node.tagName + '>');
    } else if (node.nodeType == Node.TEXT_NODE) {
      actual.push(node.nodeValue);
    }
  }
  console.log(expected, actual);
  if (expected.length != actual.length) {
    fail('expected ' + expected + ' but found ' + actual);
  }
  assertArrayEquals(expected, actual);
}

function assertChildren(expectedNodes, element) {
  assertNodes(expectedNodes, element.childNodes);
}
