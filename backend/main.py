from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from database import save_code, get_code
from judge0_runner import run_code_in_judge0

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://prompt-pad-sarnitha-a-ds-projects.vercel.app"],
    allow_credentials=True,
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
            run_code_in_judge0(req.code, req.input, req.language),
            media_type="text/plain"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save")
async def save(req: SaveRequest):
    try:
        code_id = save_code(req.code, req.title, req.language)
        return {"id": code_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save code: " + str(e))

@app.get("/load/{code_id}")
async def load(code_id: str):
    code = get_code(code_id)
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    return code

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
