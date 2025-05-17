import requests
import os
import time

JUDGE0_URL = os.getenv("JUDGE0_URL", "https://judge0-ce.p.rapidapi.com")
JUDGE0_KEY = os.getenv("JUDGE0_KEY", "sharnithadhandapani")  # Optional: for RapidAPI

LANGUAGE_MAP = {
    "python": 71,      # Python 3.x
    "c": 50,           # C
    "cpp": 54,         # C++
    "java": 62,        # Java
    "csharp": 51,      # C# (Mono)
    "cs": 51,           # Alias for C#
    "javascript": 63,  # JavaScript (Node.js)
    "js": 63          # Alias for JavaScript

}
def run_code_in_judge0(code, stdin, language):
    lang_id = LANGUAGE_MAP.get(language.lower())
    resp = requests.post(...)
    print("Judge0 submit response:", resp.status_code, resp.text)
    if resp.status_code != 201:
        yield b"Failed to submit code."
        return
    if not lang_id:
        yield b"Unsupported language."
        return

    headers = {
        "Content-Type": "application/json"
    }
    if JUDGE0_KEY:
        headers["X-RapidAPI-Key"] = JUDGE0_KEY

    data = {
        "source_code": code,
        "language_id": lang_id,
        "stdin": stdin or ""
    }
    # Submit code
    resp = requests.post(f"{JUDGE0_URL}/submissions/?base64_encoded=false&wait=false", json=data, headers=headers)
    token = resp.json().get("token")
    if not token:
        yield b"Failed to submit code."
        return

    # Poll for result
    for _ in range(20):
        r = requests.get(f"{JUDGE0_URL}/submissions/{token}?base64_encoded=false", headers=headers)
        result = r.json()
        status = result.get("status", {}).get("description")
        if status in ("Accepted", "Compilation Error", "Runtime Error (NZEC)", "Time Limit Exceeded"):
            output = result.get("stdout") or result.get("compile_output") or result.get("stderr") or ""
            yield output.encode()
            return
        time.sleep(1)
    yield b"Timed out waiting for result."
