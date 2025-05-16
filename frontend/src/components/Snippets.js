import React from "react";

const pythonSnippets = [
  { name: "Hello World", code: 'print("Hello, World!")' },
  { name: "Input Example", code: 'name = input("Enter your name: ")\nprint("Hi", name)' },
  { name: "For Loop", code: 'for i in range(5):\n    print(i)' },
];

const jsSnippets = [
  { name: "Hello World", code: 'console.log("Hello, World!");' },
  { name: "Prompt Example", code: 'let name = prompt("Enter your name: ");\nconsole.log("Hi", name);' },
  { name: "For Loop", code: 'for (let i = 0; i < 5; i++) {\n    console.log(i);\n}' },
];

const cSnippets = [
  { name: "Hello World", code: '#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
  { name: "Input Example", code: '#include <stdio.h>\nint main() {\n    char name[100];\n    printf("Enter your name: ");\n    scanf("%99s", name);\n    printf("Hi %s\\n", name);\n    return 0;\n}' },
  { name: "For Loop", code: '#include <stdio.h>\nint main() {\n    for(int i = 0; i < 5; i++) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}' },
];

const cppSnippets = [
  { name: "Hello World", code: '#include <iostream>\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' },
  { name: "Input Example", code: '#include <iostream>\n#include <string>\nint main() {\n    std::string name;\n    std::cout << "Enter your name: ";\n    std::cin >> name;\n    std::cout << "Hi " << name << std::endl;\n    return 0;\n}' },
  { name: "For Loop", code: '#include <iostream>\nint main() {\n    for(int i = 0; i < 5; i++) {\n        std::cout << i << std::endl;\n    }\n    return 0;\n}' },
];

const javaSnippets = [
  { name: "Hello World", code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
  { name: "Input Example", code: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = sc.nextLine();\n        System.out.println("Hi " + name);\n    }\n}' },
  { name: "For Loop", code: 'public class Main {\n    public static void main(String[] args) {\n        for(int i = 0; i < 5; i++) {\n            System.out.println(i);\n        }\n    }\n}' },
];

const csharpSnippets = [
  { name: "Hello World", code: 'using System;\nclass Program {\n    static void Main(string[] args) {\n        Console.WriteLine("Hello, World!");\n    }\n}' },
  { name: "Input Example", code: 'using System;\nclass Program {\n    static void Main(string[] args) {\n        Console.Write("Enter your name: ");\n        string name = Console.ReadLine();\n        Console.WriteLine("Hi " + name);\n    }\n}' },
  { name: "For Loop", code: 'using System;\nclass Program {\n    static void Main(string[] args) {\n        for(int i = 0; i < 5; i++) {\n            Console.WriteLine(i);\n        }\n    }\n}' },
];

const SNIPPETS = {
  python: pythonSnippets,
  javascript: jsSnippets,
  c: cSnippets,
  cpp: cppSnippets,
  java: javaSnippets,
  csharp: csharpSnippets,
};

function Snippets({ setCode, language }) {
  const snippets = SNIPPETS[language] || [];
  return (
    <div className="snippets">
      <h3>Snippets</h3>
      {snippets.map(s => (
        <button key={s.name} onClick={() => setCode(s.code)}>{s.name}</button>
      ))}
    </div>
  );
}

export default Snippets;
