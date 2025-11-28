import type { Monaco } from "@monaco-editor/react";

const setupPythonLanguage = (monaco: Monaco) => {
  monaco.languages.registerCompletionItemProvider("python", {
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
          "def",
          "class",
          "if",
          "elif",
          "else",
          "for",
          "while",
          "in",
          "return",
          "import",
          "from",
          "as",
          "try",
          "except",
          "finally",
          "with",
          "lambda",
          "yield",
          "pass",
          "break",
          "continue",
          "True",
          "False",
          "None",
          "and",
          "or",
          "not",
          "is",
          "raise",
          "global",
          "nonlocal",
          "assert",
          "del",
        ].map((keyword) => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          range: range,
        })),

        // Common functions and snippets
        {
          label: "print",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "print(${1:})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Print to console",
          range: range,
        },
        {
          label: "def",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "def ${1:function_name}(${2:}):\n\t${3:pass}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Define a function",
          range: range,
        },
        {
          label: "class",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "class ${1:ClassName}:\n\tdef __init__(self${2:}):\n\t\t${3:pass}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Define a class",
          range: range,
        },
        {
          label: "if",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "if ${1:condition}:\n\t${2:pass}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "If statement",
          range: range,
        },
        {
          label: "for",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "for ${1:item} in ${2:iterable}:\n\t${3:pass}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "For loop",
          range: range,
        },
        // Built-in functions
        ...[
          "len",
          "range",
          "str",
          "int",
          "float",
          "list",
          "dict",
          "tuple",
          "set",
          "open",
          "input",
          "type",
          "isinstance",
          "enumerate",
          "zip",
          "map",
          "filter",
          "sorted",
        ].map((func) => ({
          label: func,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: `${func}(\${1:})`,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
        })),
      ];

      return { suggestions };
    },
  });
};

export default setupPythonLanguage;
