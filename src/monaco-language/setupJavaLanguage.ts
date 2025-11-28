import type { Monaco } from "@monaco-editor/react";

const setupJavaLanguage = (monaco: Monaco) => {
  monaco.languages.registerCompletionItemProvider("java", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: any[] = [
        // ========== KEYWORDS ==========
        ...[
          "abstract",
          "assert",
          "boolean",
          "break",
          "byte",
          "case",
          "catch",
          "char",
          "class",
          "const",
          "continue",
          "default",
          "do",
          "double",
          "else",
          "enum",
          "extends",
          "final",
          "finally",
          "float",
          "for",
          "goto",
          "if",
          "implements",
          "import",
          "instanceof",
          "int",
          "interface",
          "long",
          "native",
          "new",
          "package",
          "private",
          "protected",
          "public",
          "return",
          "short",
          "static",
          "strictfp",
          "super",
          "switch",
          "synchronized",
          "this",
          "throw",
          "throws",
          "transient",
          "try",
          "void",
          "volatile",
          "while",
        ].map((keyword) => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          range: range,
        })),

        // ========== LITERALS ==========
        ...["true", "false", "null"].map((literal) => ({
          label: literal,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: literal,
          range: range,
        })),

        // ========== PRIMITIVE TYPES ==========
        ...[
          "byte",
          "short",
          "int",
          "long",
          "float",
          "double",
          "boolean",
          "char",
        ].map((type) => ({
          label: type,
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: type,
          range: range,
        })),

        // ========== COMMON CLASSES ==========
        ...[
          "String",
          "Object",
          "Integer",
          "Double",
          "Float",
          "Long",
          "Short",
          "Byte",
          "Character",
          "Boolean",
          "Number",
          "Math",
          "System",
          "Thread",
          "Runnable",
          "Exception",
          "RuntimeException",
          "Error",
          "Throwable",
          "Class",
          "Void",
        ].map((className) => ({
          label: className,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: className,
          documentation: `java.lang.${className}`,
          range: range,
        })),

        // ========== JAVA.UTIL COLLECTIONS ==========
        {
          label: "ArrayList",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "ArrayList<${1:Type}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Resizable array implementation of List interface",
          detail: "java.util.ArrayList",
          range: range,
        },
        {
          label: "LinkedList",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "LinkedList<${1:Type}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Doubly-linked list implementation",
          detail: "java.util.LinkedList",
          range: range,
        },
        {
          label: "HashMap",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "HashMap<${1:Key}, ${2:Value}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Hash table based implementation of Map interface",
          detail: "java.util.HashMap",
          range: range,
        },
        {
          label: "HashSet",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "HashSet<${1:Type}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Set implementation backed by a hash table",
          detail: "java.util.HashSet",
          range: range,
        },
        {
          label: "TreeMap",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "TreeMap<${1:Key}, ${2:Value}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Red-Black tree based NavigableMap implementation",
          detail: "java.util.TreeMap",
          range: range,
        },
        {
          label: "TreeSet",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "TreeSet<${1:Type}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "NavigableSet implementation based on TreeMap",
          detail: "java.util.TreeSet",
          range: range,
        },
        {
          label: "LinkedHashMap",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "LinkedHashMap<${1:Key}, ${2:Value}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Hash table and linked list implementation of Map",
          detail: "java.util.LinkedHashMap",
          range: range,
        },
        {
          label: "LinkedHashSet",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "LinkedHashSet<${1:Type}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Hash table and linked list implementation of Set",
          detail: "java.util.LinkedHashSet",
          range: range,
        },
        {
          label: "PriorityQueue",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "PriorityQueue<${1:Type}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Priority heap implementation of Queue",
          detail: "java.util.PriorityQueue",
          range: range,
        },
        {
          label: "Stack",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "Stack<${1:Type}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "LIFO stack implementation",
          detail: "java.util.Stack",
          range: range,
        },
        {
          label: "Vector",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "Vector<${1:Type}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Synchronized resizable array",
          detail: "java.util.Vector",
          range: range,
        },
        {
          label: "Hashtable",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "Hashtable<${1:Key}, ${2:Value}>",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Synchronized hash table implementation",
          detail: "java.util.Hashtable",
          range: range,
        },

        // ========== INTERFACES ==========
        ...[
          "List",
          "Set",
          "Map",
          "Queue",
          "Deque",
          "Collection",
          "Iterator",
          "Iterable",
          "Comparable",
          "Comparator",
          "Serializable",
          "Cloneable",
        ].map((interfaceName) => ({
          label: interfaceName,
          kind: monaco.languages.CompletionItemKind.Interface,
          insertText: interfaceName,
          documentation: `java.util.${interfaceName}`,
          range: range,
        })),

        // ========== JAVA.IO CLASSES ==========
        ...[
          "File",
          "FileReader",
          "FileWriter",
          "BufferedReader",
          "BufferedWriter",
          "FileInputStream",
          "FileOutputStream",
          "ObjectInputStream",
          "ObjectOutputStream",
          "PrintWriter",
          "Scanner",
          "InputStream",
          "OutputStream",
          "Reader",
          "Writer",
        ].map((className) => ({
          label: className,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: className,
          documentation: `java.io.${className}`,
          range: range,
        })),

        // ========== EXCEPTIONS ==========
        ...[
          "IOException",
          "FileNotFoundException",
          "NullPointerException",
          "IndexOutOfBoundsException",
          "IllegalArgumentException",
          "NumberFormatException",
          "ArithmeticException",
          "ClassCastException",
          "IllegalStateException",
          "UnsupportedOperationException",
          "ConcurrentModificationException",
        ].map((exception) => ({
          label: exception,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: exception,
          documentation: `Exception: ${exception}`,
          range: range,
        })),

        // ========== ANNOTATIONS ==========
        ...[
          "@Override",
          "@Deprecated",
          "@SuppressWarnings",
          "@FunctionalInterface",
          "@SafeVarargs",
          "@Retention",
          "@Target",
          "@Documented",
          "@Inherited",
          "@Repeatable",
          "@Entity",
          "@Table",
          "@Column",
          "@Id",
          "@GeneratedValue",
          "@Autowired",
          "@Component",
          "@Service",
          "@Repository",
          "@Controller",
          "@RestController",
          "@RequestMapping",
          "@GetMapping",
          "@PostMapping",
          "@PutMapping",
          "@DeleteMapping",
          "@PathVariable",
          "@RequestParam",
          "@RequestBody",
          "@ResponseBody",
        ].map((annotation) => ({
          label: annotation,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: annotation,
          documentation: `Annotation: ${annotation}`,
          range: range,
        })),

        // ========== CODE SNIPPETS ==========
        {
          label: "main",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "public static void main(String[] args) {\n\t${1:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Main method declaration",
          range: range,
        },
        {
          label: "psvm",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "public static void main(String[] args) {\n\t${1:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Main method (shortcut)",
          range: range,
        },
        {
          label: "sout",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "System.out.println(${1:});",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Print to console",
          range: range,
        },
        {
          label: "System.out.println",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "System.out.println(${1:});",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Print line to standard output",
          range: range,
        },
        {
          label: "System.out.print",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "System.out.print(${1:});",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Print to standard output",
          range: range,
        },
        {
          label: "System.err.println",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "System.err.println(${1:});",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Print line to standard error",
          range: range,
        },
        {
          label: "class",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "public class ${1:ClassName} {\n\t${2:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Public class declaration",
          range: range,
        },
        {
          label: "interface",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "public interface ${1:InterfaceName} {\n\t${2:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Interface declaration",
          range: range,
        },
        {
          label: "enum",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "public enum ${1:EnumName} {\n\t${2:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Enum declaration",
          range: range,
        },
        {
          label: "constructor",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "public ${1:ClassName}(${2:}) {\n\t${3:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Constructor declaration",
          range: range,
        },
        {
          label: "getter",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "public ${1:Type} get${2:PropertyName}() {\n\treturn ${3:field};\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Getter method",
          range: range,
        },
        {
          label: "setter",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "public void set${1:PropertyName}(${2:Type} ${3:param}) {\n\tthis.${3:param} = ${3:param};\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Setter method",
          range: range,
        },
        {
          label: "for",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "for (${1:int i = 0}; ${2:i < length}; ${3:i++}) {\n\t${4:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "For loop",
          range: range,
        },
        {
          label: "foreach",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "for (${1:Type} ${2:item} : ${3:collection}) {\n\t${4:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Enhanced for loop (foreach)",
          range: range,
        },
        {
          label: "fori",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "For loop with int index",
          range: range,
        },
        {
          label: "while",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "while (${1:condition}) {\n\t${2:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "While loop",
          range: range,
        },
        {
          label: "do-while",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "do {\n\t${1:}\n} while (${2:condition});",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Do-while loop",
          range: range,
        },
        {
          label: "if",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "if (${1:condition}) {\n\t${2:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "If statement",
          range: range,
        },
        {
          label: "ifelse",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "if (${1:condition}) {\n\t${2:}\n} else {\n\t${3:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "If-else statement",
          range: range,
        },
        {
          label: "switch",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "switch (${1:expression}) {\n\tcase ${2:value}:\n\t\t${3:}\n\t\tbreak;\n\tdefault:\n\t\t${4:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Switch statement",
          range: range,
        },
        {
          label: "try-catch",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "try {\n\t${1:}\n} catch (${2:Exception} ${3:e}) {\n\t${4:e.printStackTrace();}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Try-catch block",
          range: range,
        },
        {
          label: "try-catch-finally",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "try {\n\t${1:}\n} catch (${2:Exception} ${3:e}) {\n\t${4:e.printStackTrace();}\n} finally {\n\t${5:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Try-catch-finally block",
          range: range,
        },
        {
          label: "try-with-resources",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "try (${1:Resource} ${2:resource} = ${3:}) {\n\t${4:}\n} catch (${5:Exception} ${6:e}) {\n\t${7:e.printStackTrace();}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Try-with-resources statement",
          range: range,
        },
        {
          label: "synchronized",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "synchronized (${1:this}) {\n\t${2:}\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Synchronized block",
          range: range,
        },

        // ========== COMMON METHODS ==========
        {
          label: "toString",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "@Override\npublic String toString() {\n\treturn ${1:};\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Override toString method",
          range: range,
        },
        {
          label: "equals",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "@Override\npublic boolean equals(Object ${1:obj}) {\n\tif (this == ${1:obj}) return true;\n\tif (${1:obj} == null || getClass() != ${1:obj}.getClass()) return false;\n\t${2:}\n\treturn ${3:};\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Override equals method",
          range: range,
        },
        {
          label: "hashCode",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "@Override\npublic int hashCode() {\n\treturn ${1:Objects.hash()};\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Override hashCode method",
          range: range,
        },
        {
          label: "compareTo",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText:
            "@Override\npublic int compareTo(${1:Type} ${2:other}) {\n\treturn ${3:};\n}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Override compareTo method",
          range: range,
        },

        // ========== LAMBDA & STREAMS ==========
        {
          label: "lambda",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "(${1:params}) -> ${2:expression}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Lambda expression",
          range: range,
        },
        {
          label: "stream",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "stream()",
          documentation: "Get stream from collection",
          range: range,
        },
        {
          label: "forEach",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "forEach(${1:item} -> ${2:})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Iterate over collection",
          range: range,
        },
        {
          label: "filter",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "filter(${1:item} -> ${2:condition})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Filter stream elements",
          range: range,
        },
        {
          label: "map",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "map(${1:item} -> ${2:transformation})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Transform stream elements",
          range: range,
        },
        {
          label: "collect",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "collect(Collectors.${1:toList}())",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Collect stream results",
          range: range,
        },

        // ========== COMMON STATIC METHODS ==========
        {
          label: "Arrays.asList",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "Arrays.asList(${1:})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Create list from array",
          detail: "java.util.Arrays",
          range: range,
        },
        {
          label: "Collections.sort",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "Collections.sort(${1:list})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Sort a list",
          detail: "java.util.Collections",
          range: range,
        },
        {
          label: "Math.max",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "Math.max(${1:a}, ${2:b})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Return maximum of two values",
          range: range,
        },
        {
          label: "Math.min",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "Math.min(${1:a}, ${2:b})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Return minimum of two values",
          range: range,
        },
        {
          label: "Math.abs",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "Math.abs(${1:value})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Return absolute value",
          range: range,
        },
        {
          label: "Math.pow",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "Math.pow(${1:base}, ${2:exponent})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Return value raised to power",
          range: range,
        },
        {
          label: "Math.sqrt",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "Math.sqrt(${1:value})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Return square root",
          range: range,
        },
        {
          label: "Math.random",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "Math.random()",
          documentation: "Return random double between 0.0 and 1.0",
          range: range,
        },
        {
          label: "String.format",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "String.format(${1:format}, ${2:args})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Format string with arguments",
          range: range,
        },
        {
          label: "Integer.parseInt",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "Integer.parseInt(${1:string})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Parse string to integer",
          range: range,
        },
        {
          label: "Double.parseDouble",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "Double.parseDouble(${1:string})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Parse string to double",
          range: range,
        },
        {
          label: "Objects.equals",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "Objects.equals(${1:a}, ${2:b})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Compare two objects for equality",
          detail: "java.util.Objects",
          range: range,
        },
        {
          label: "Objects.hash",
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: "Objects.hash(${1:values})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Generate hash code for values",
          detail: "java.util.Objects",
          range: range,
        },
      ];

      return { suggestions };
    },
  });
};

export default setupJavaLanguage;
