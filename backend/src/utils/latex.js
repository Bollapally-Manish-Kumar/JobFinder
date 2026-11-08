const DOCUMENT_CLASS = '\\documentclass';
const BEGIN_DOCUMENT = '\\begin{document}';
const END_DOCUMENT = '\\end{document}';

/**
 * Extract one complete LaTeX document, ignoring surrounding prose and fences.
 * Returns null when the response does not contain one balanced document.
 */
export const extractLatexDocument = (response) => {
  if (typeof response !== 'string') {
    return null;
  }

  const responseText = response.trim();
  const documentClassIndex = responseText.indexOf(DOCUMENT_CLASS);
  if (documentClassIndex === -1) {
    return null;
  }

  const document = responseText.slice(documentClassIndex);
  const beginIndex = document.indexOf(BEGIN_DOCUMENT);
  const endIndex = document.indexOf(END_DOCUMENT);

  if (beginIndex === -1 || endIndex === -1 || endIndex < beginIndex) {
    return null;
  }

  const latex = document.slice(0, endIndex + END_DOCUMENT.length).trim();
  const beginMarkers = latex.match(/\\begin\{document\}/g) || [];
  const endMarkers = latex.match(/\\end\{document\}/g) || [];

  if (
    !latex.startsWith(DOCUMENT_CLASS)
    || beginMarkers.length !== 1
    || endMarkers.length !== 1
  ) {
    return null;
  }

  return latex;
};
