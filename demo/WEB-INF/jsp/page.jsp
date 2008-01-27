<%@ taglib prefix="x" tagdir="/WEB-INF/tags/x" %>
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

<h1>JSPscript examples</h1>

<div class="example">
  <div class="sample">
    attr from outside \${value}, &lt;x:test tagValue="also"&gt;inside a tag body it \${value} \${tagValue}!&lt;/x:test&gt;
  </div>
  <div class="output">
    <jsp:include page="WEB-INF/jsp/attributes.jspf"/>
  </div>
</div>

</body>
</html>
