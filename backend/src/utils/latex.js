const DOCUMENT_CLASS = /\\documentclass\s*(?:\[[^\]]*\]\s*)?\{[^}]+\}/g;
const BEGIN_DOCUMENT = /\\begin\s*\{\s*document\s*\}/g;
const END_DOCUMENT = /\\end\s*\{\s*document\s*\}/g;

const withoutComments = (latex) => latex.replace(/(?<!\\)%.*$/gm, '');

/**
 * Extract one complete LaTeX document, ignoring surrounding prose and fences.
 * Returns null when the response does not contain one balanced document.
 */
export const extractLatexDocument = (response) => {
  if (typeof response !== 'string') {
    return null;
  }

  const responseText = response.trim();
  for (const declaration of responseText.matchAll(DOCUMENT_CLASS)) {
    const document = responseText.slice(declaration.index);
    const beginMatch = BEGIN_DOCUMENT.exec(document);
    BEGIN_DOCUMENT.lastIndex = 0;
    if (!beginMatch) {
      continue;
    }

    const contentAfterBegin = document.slice(beginMatch.index + beginMatch[0].length);
    const endMatch = END_DOCUMENT.exec(contentAfterBegin);
    END_DOCUMENT.lastIndex = 0;
    if (!endMatch) {
      continue;
    }

    const latex = document.slice(
      0,
      beginMatch.index + beginMatch[0].length + endMatch.index + endMatch[0].length
    ).trim();
    const latexWithoutComments = withoutComments(latex);
    const beginMarkers = [...latexWithoutComments.matchAll(BEGIN_DOCUMENT)];
    BEGIN_DOCUMENT.lastIndex = 0;
    const endMarkers = [...latexWithoutComments.matchAll(END_DOCUMENT)];
    END_DOCUMENT.lastIndex = 0;

    if (beginMarkers.length === 1 && endMarkers.length === 1) {
      return latex;
    }
  }

  return null;
};
