from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from database import save_code, get_code
from docker_runner import run_code_in_docker

app = FastAPI()

# Allow all origins for development; restrict in production if needed!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    input: Optional[str] = ""
    language: str

class SaveRequest(BaseModel):
    code: str
    title: Optional[str] = ""
    language: str

@app.get("/")
async def root():
    return {"message": "Prompt Pad API is running."}

@app.post("/run")
async def run_code(req: CodeRequest):
    try:
        return StreamingResponse(
            run_code_in_docker(req.code, req.input, req.language),
            media_type="text/plain"
        )
    except Exception as e:
        # Optionally log the error here
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save")
async def save(req: SaveRequest):
    code_id = save_code(req.code, req.title, req.language)
    return {"id": code_id}

@app.get("/load/{code_id}")
async def load(code_id: str):
    code = get_code(code_id)
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    return code

@app.get("/snippets")
async def snippets():
    # This endpoint is not used in your current UI, but kept for completeness
    return {
        "python": [
            {"title": "Hello World", "code": "print('Hello, World!')"},
            {"title": "Input Example", "code": "name = input('Enter your name: ')\nprint('Hi', name)"},
        ],
        "c": [
            {"title": "Hello World", "code": "#include <stdio.h>\nint main() {\n  printf(\"Hello, World!\\n\");\n  return 0;\n}"},
            {"title": "Input Example", "code": "#include <stdio.h>\nint main() {\n  char name[100];\n  printf(\"Enter your name: \");\n  scanf(\"%s\", name);\n  printf(\"Hi %s\\n\", name);\n  return 0;\n}"},
        ],
        "cpp": [
            {"title": "Hello World", "code": "#include <iostream>\nint main() {\n  std::cout << \"Hello, World!\\n\";\n  return 0;\n}"},
            {"title": "Input Example", "code": "#include <iostream>\nusing namespace std;\nint main() {\n  string name;\n  cout << \"Enter your name: \";\n  cin >> name;\n  cout << \"Hi \" << name << endl;\n  return 0;\n}"},
        ],
        "java": [
            {"title": "Hello World", "code": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, World!\");\n  }\n}"},
            {"title": "Input Example", "code": "import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    System.out.print(\"Enter your name: \");\n    String name = sc.nextLine();\n    System.out.println(\"Hi \" + name);\n  }\n}"},
        ],
        "csharp": [
            {"title": "Hello World", "code": "using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine(\"Hello, World!\");\n  }\n}"},
            {"title": "Input Example", "code": "using System;\nclass Program {\n  static void Main() {\n    Console.Write(\"Enter your name: \");\n    string name = Console.ReadLine();\n    Console.WriteLine(\"Hi \" + name);\n  }\n}"},
        ],
        "javascript": [
            {"title": "Hello World", "code": "console.log('Hello, World!');"},
            {"title": "Input Example", "code": "const readline = require('readline');\nconst rl = readline.createInterface({input: process.stdin, output: process.stdout});\nrl.question('Enter your name: ', function(name) {\n  console.log('Hi ' + name);\n  rl.close();\n});"},
        ],
    }

@app.get("/help")
async def help():
    return {
        "tips": [
            "Use the language selector to choose your programming language.",
            "Input for your code goes in the 'Input' box. It works with input(), scanf, cin, Scanner, Console.ReadLine, or readline as appropriate.",
            "Errors will show in the terminal below.",
            "You can save and share your code using the Share button.",
            "Switch themes for comfortable coding!"
        ]
    }
