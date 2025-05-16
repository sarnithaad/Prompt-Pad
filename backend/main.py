from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import uuid
import os
import json
import sys
import tempfile
import shutil
import re

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],  # For dev; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CODE_DB_PATH = "shared_codes.json"
if not os.path.exists(CODE_DB_PATH):
    with open(CODE_DB_PATH, "w", encoding="utf-8") as f:
        json.dump({}, f)

LANG_CONFIG = {
    "python": {
        "ext": ".py",
        "run": lambda filename, _: (
            ["python3", filename] if sys.platform != "win32" else ["python", filename]
        ),
        "input_supported": True,
        "compiled": False
    },
    "javascript": {
        "ext": ".js",
        "run": lambda filename, _: ["node", filename],
        "input_supported": False,  # stdin is not easily supported for Node.js in this setup
        "compiled": False
    },
    "c": {
        "ext": ".c",
        "run": lambda filename, tempdir: [
            os.path.join(tempdir, "a.out") if sys.platform != "win32" else os.path.join(tempdir, "a.exe")
        ],
        "compile": lambda filename, tempdir: [
            "gcc", filename, "-o",
            os.path.join(tempdir, "a.out" if sys.platform != "win32" else "a.exe")
        ],
        "input_supported": True,
        "compiled": True
    },
    "cpp": {
        "ext": ".cpp",
        "run": lambda filename, tempdir: [
            os.path.join(tempdir, "a.out") if sys.platform != "win32" else os.path.join(tempdir, "a.exe")
        ],
        "compile": lambda filename, tempdir: [
            "g++", filename, "-o",
            os.path.join(tempdir, "a.out" if sys.platform != "win32" else "a.exe")
        ],
        "input_supported": True,
        "compiled": True
    },
    "java": {
        "ext": ".java",
        "run": lambda filename, tempdir: [
            "java", "-cp", tempdir, "Main"
        ],
        "compile": lambda filename, tempdir: [
            "javac", "-d", tempdir, filename
        ],
        "input_supported": True,
        "compiled": True
    },
    "csharp": {
        "ext": ".cs",
        "run": lambda filename, tempdir: [
            "dotnet", os.path.join(tempdir, "Program.dll")
        ],
        "compile": lambda filename, tempdir: [
            "dotnet", "build", filename, "-o", tempdir
        ],
        "input_supported": True,
        "compiled": True
    }
}

class CodeRequest(BaseModel):
    code: str
    inputs: str = ""
    language: str = "python"

class ShareRequest(BaseModel):
    code: str
    language: str

@app.get("/")
async def root():
    return {"message": "Prompt Pad backend is running. Visit /docs for API documentation."}

@app.post("/run")
async def run_code(req: CodeRequest):
    lang = req.language.lower()
    if lang not in LANG_CONFIG:
        return {"output": "", "error": f"Language '{lang}' is not supported."}

    config = LANG_CONFIG[lang]
    ext = config["ext"]
    can_input = config["input_supported"]
    code_id = str(uuid.uuid4())
    tempdir = tempfile.mkdtemp()
    code_file = os.path.join(tempdir, f"{code_id}{ext}")

    # For Java, class name must match file name
    if lang == "java":
        code_file = os.path.join(tempdir, "Main.java")
        # Replace any 'public class <Name>' with 'public class Main'
        req.code = re.sub(r'public\s+class\s+\w+', 'public class Main', req.code)

    # For C#, file must be Program.cs
    if lang == "csharp":
        code_file = os.path.join(tempdir, "Program.cs")

    with open(code_file, "w", encoding="utf-8") as f:
        f.write(req.code)

    try:
        # Compile if needed
        if config.get("compiled"):
            compile_cmd = config["compile"](code_file, tempdir)
            compile_proc = subprocess.Popen(
                compile_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=tempdir
            )
            compile_out, compile_err = compile_proc.communicate(timeout=10)
            if compile_proc.returncode != 0:
                # Return both stdout and stderr for better debugging
                error_msg = f"Compilation failed:\n{compile_err or ''}\n{compile_out or ''}".strip()
                return {"output": "", "error": error_msg}

        # Run the program
        run_cmd = config["run"](code_file, tempdir)
        proc = subprocess.Popen(
            run_cmd,
            stdin=subprocess.PIPE if can_input else None,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=tempdir
        )
        try:
            if can_input:
                outs, errs = proc.communicate(input=req.inputs, timeout=10)
            else:
                outs, errs = proc.communicate(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()
            return {"output": "", "error": "Execution timed out."}
        return {"output": outs, "error": errs}
    except Exception as e:
        return {"output": "", "error": f"Server error: {str(e)}"}
    finally:
        shutil.rmtree(tempdir, ignore_errors=True)

@app.post("/share")
async def share_code(req: ShareRequest):
    code_id = str(uuid.uuid4())[:8]
    with open(CODE_DB_PATH, "r", encoding="utf-8") as f:
        db = json.load(f)
    db[code_id] = {"code": req.code, "language": req.language}
    with open(CODE_DB_PATH, "w", encoding="utf-8") as f:
        json.dump(db, f)
    return {"id": code_id}

@app.get("/share/{code_id}")
async def get_shared_code(code_id: str):
    with open(CODE_DB_PATH, "r", encoding="utf-8") as f:
        db = json.load(f)
    if code_id not in db:
        raise HTTPException(status_code=404, detail="Code not found")
    return db[code_id]
