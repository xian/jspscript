<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="declarations.jspf" %>
<html>
<head>
  <title>JSPscript Demo</title>
  <style type="text/css">
    .sample {
      border: 1px solid black;
      font-family: monospace;
      font-size: 10px;
      padding: 10px;
    }

    .output {
      border: 1px solid black;
      font-size: 12px;
      padding: 10px;
    }
  </style>
</head>
<body>

<h1>JSPscript examples</h1>

<div class="example">
    <x:showFile fileName="WEB-INF/jsp/attributes.jspf"/>
    <x:showFile fileName="WEB-INF/jsp/declarations.jspf"/>
  <div class="output">
    <jsp:include page="/WEB-INF/jsp/attributes.jspf"/>
  </div>
</div>

</body>
</html>
