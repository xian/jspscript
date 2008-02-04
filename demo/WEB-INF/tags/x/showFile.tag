<%@ include file="/WEB-INF/jsp/declarations.jspf"%>
<%@ attribute name="fileName"%>

<div class="sample">
<pre>${xfns:includeUrlText(fileName)}</pre>
</div>