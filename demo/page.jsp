<%@ taglib prefix="x" uri="http://xxx/xxx" %>
<html>
<head>
  <title>JSPscript Demo</title>
  <style type="text/css">
    .sample {
      border: 1px solid black;
      font-family: monospace;
    }
  </style>
</head>
<body>

<div class="example">
  <div class="sample">
    attr from outside \${value}, &lt;x:test tagValue="also"&gt;inside a tag body it \${value} \${tagValue}!&lt;/x:test&gt;
  </div>
  <div class="output">
    attr from outside ${value}, <x:test tagValue="also">inside a tag body it ${value} ${tagValue}!</x:test>
  </div>
</div>

</body>
</html>
