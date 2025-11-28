import type { Monaco } from "@monaco-editor/react";

const setupCppLanguage = (monaco: Monaco) => {
  monaco.languages.registerCompletionItemProvider("cpp", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: any[] = [
        // Keywords
        ...[
          "int",
          "float",
          "double",
          "char",
          "bool",
          "void",
          "long",
          "short",
          "unsigned",
          "signed",
          "const",
          "static",
          "extern",
          "auto",
          "register",
          "volatile",
          "class",
          "struct",
          "union",
          "enum",
          "typedef",
          "public",
          "private",
          "protected",
          "virtual",
          "friend",
          "inline",
          "operator",
          "sizeof",
          "new",
          "delete",
          "this",
          "namespace",
          "using",
          "if",
          "else",
          "switch",
          "case",
          "default",
          "for",
          "while",
          "do",
          "break",
          "continue",
          "return",
          "goto",
          "try",
          "catch",
          "throw",
          "template",
          "typename",
        ].map((keyword) => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          range: range,
        })),

        // Common snippets
        {
          label: "cout",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "std::cout << ${1:} << std::endl;",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Output to console",
          range: range,
        },
        {
          label: "cin",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "std::cin >> ${1:};",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Input from console",
          range: range,
        },
        {
          label: "main",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "int main() {\n\t${1:}\n\treturn 0;\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Main function",
          range: range,
        },
        {
          label: "include",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "#include <${1:iostream}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Include header",
          range: range,
        },
        {
          label: "class",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "class ${1:ClassName} {\npublic:\n\t${1:ClassName}();\n\t~${1:ClassName}();\nprivate:\n\t${2:}\n};",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Class definition",
          range: range,
        },
        {
          label: "for",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "for (${1:int i = 0}; ${2:i < n}; ${3:i++}) {\n\t${4:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "For loop",
          range: range,
        },
        // STL containers
        ...[
          "vector",
          "map",
          "set",
          "list",
          "deque",
          "queue",
          "stack",
          "string",
        ].map((container) => ({
          label: `std::${container}`,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: `std::${container}<\${1:Type}>`,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: `STL ${container}`,
          range: range,
        })),
      ];

      return { suggestions };
    },
  });
};

export default setupCppLanguage;
