<%@ taglib prefix="x" tagdir="/WEB-INF/tags/x" %>
<%@ taglib prefix="xfns" uri="http://jspscript.sourceforge.net/demo/xfns/1.0" %>
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
    <pre>${xfns:includeUrlText('WEB-INF/jsp/attributes.jspf')}</pre>
  </div>
  <div class="output">
    <jsp:include page="WEB-INF/jsp/attributes.jspf"/>
  </div>
</div>

</body>
</html>
