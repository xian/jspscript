
function assertNodes(expectedNodes, nodes) {
  console.log(nodes);
  var actual = [];
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (node.nodeType == Node.ELEMENT_NODE) {
      actual.push('<' + node.tagName + '>');
    } else if (node.nodeType == Node.TEXT_NODE) {
      actual.push(node.nodeValue);
    }
  }
  console.log(expectedNodes, actual);
  if (expectedNodes.length != actual.length) {
    fail('expected ' + expectedNodes + ' but found ' + actual);
  }
  assertArrayEquals(expectedNodes, actual);
}

function assertChildren(expectedNodes, element) {
  assertNodes(expectedNodes, element.childNodes);
}
