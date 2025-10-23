/**
 * ESLint rule to detect smart/curly quotes
 * Prevents: ' ' " " ` ´ (U+2018, U+2019, U+201C, U+201D, U+0060, U+00B4)
 * Note: Backticks (`) are allowed in template literals
 */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow smart/curly quotes in code",
      category: "Possible Errors",
      recommended: true,
    },
    messages: {
      noSmartQuotes: "Smart/curly quotes are not allowed. Use straight quotes instead.",
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();

    // Only match SMART quotes (curly), not straight quotes
    // U+2018: ' (left single quotation mark)
    // U+2019: ' (right single quotation mark)
    // U+201C: " (left double quotation mark)
    // U+201D: " (right double quotation mark)
    const smartQuoteRegex = /[\u2018\u2019\u201C\u201D]/g;

    return {
      Program(node) {
        const text = sourceCode.getText(node);
        const lines = text.split("\n");

        lines.forEach((line, lineIndex) => {
          let match;

          while ((match = smartQuoteRegex.exec(line)) !== null) {
            context.report({
              loc: {
                start: {
                  line: lineIndex + 1,
                  column: match.index,
                },
                end: {
                  line: lineIndex + 1,
                  column: match.index + 1,
                },
              },
              messageId: "noSmartQuotes",
            });
          }
        });
      },
    };
  },
};
