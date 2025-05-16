# models/code.py
from pydantic import BaseModel

class CodeShare(BaseModel):
    code: str
    language: str
