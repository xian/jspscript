//noinspection ReservedWordAsName
JspScript.Env.CTld = {
  forEach: {
    renderTag_: function(attrs, parent, tagContext) {
      var items = attrs['items'];
      var varName = attrs['var'];
      var extraAttrs = {};
      console.log(attrs);
      for (var index = 0; index < items.length; index++) {
        extraAttrs[varName] = items[index];
        tagContext.renderBody(parent, extraAttrs);
      }
    }
  },

  'if': {
    renderTag_: function(attrs, parent, tagContext) {
      var test = attrs['test'];
      if (test) {
        tagContext.renderBody(parent, {});
      }
    }
  }
}