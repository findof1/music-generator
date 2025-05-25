export function downloadSVG(filename = "score.svg") {
  const svg = document.querySelector("#boo svg");
  if (!svg) return alert("No SVG found!");

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);

  const svgBlob = new Blob(
    ['<?xml version="1.0" standalone="no"?>\r\n', source],
    { type: "image/svg+xml;charset=utf-8" }
  );

  const url = URL.createObjectURL(svgBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
window.downloadSVG = downloadSVG;