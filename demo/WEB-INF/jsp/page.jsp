<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="declarations.jspf" %>
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
    <jsp:include page="/WEB-INF/jsp/attributes.jspf"/>
  </div>
</div>

</body>
</html>
