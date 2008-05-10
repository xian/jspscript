//noinspection ReservedWordAsName
JspScript.Env.CoreTaglib = new JspScript.TagLib({
  forEach: {
    renderTag_: function(attrs, parent, tagContext) {
      var items = attrs['items'];
      var varName = attrs['var'];
      var extraAttrs = {};
//      console.log(attrs);
      var result = [];
      for (var index = 0; index < items.length; index++) {
        extraAttrs[varName] = items[index];
        var output = tagContext.renderBody(parent, extraAttrs);
//        console.log("foreach;", output.length);
        result = result.concat(output);
//        console.log(extraAttrs[varName], result.length);
      }
      return result;
    }
  },

  'if': {
    renderTag_: function(attrs, parent, tagContext) {
      var test = attrs['test'];
      return test ? tagContext.renderBody(parent, {}) : [];
    }
  },

  out: {
    renderTag_: function(attrs, parent, tagContext) {
      var value = attrs['value'];
      var escapeXml = attrs['escapeXml'];
      if (escapeXml != 'false' && escapeXml !== false) {
        value = value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;')
            ;
      }
      return [document.createTextNode(value)];
    }
  }
});