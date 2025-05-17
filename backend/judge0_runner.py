import requests
import os
import time

# Judge0 API endpoint (RapidAPI or Community Edition)
JUDGE0_URL = os.getenv("JUDGE0_URL", "https://ce.judge0.com")


LANGUAGE_MAP = {
    "python": 71,      # Python 3.x
    "c": 50,           # C
    "cpp": 54,         # C++
    "java": 62,        # Java
    "csharp": 51,      # C# (Mono)
    "cs": 51,          # Alias for C#
    "javascript": 63,  # JavaScript (Node.js)
    "js": 63           # Alias for JavaScript
}

def run_code_in_judge0(code, stdin, language):
    lang_id = LANGUAGE_MAP.get(language.lower())
    if not lang_id:
        yield b"Unsupported language."
        return

    headers = {
        "Content-Type": "application/json"
    }
    # Add RapidAPI key header if using RapidAPI
    if JUDGE0_KEY:
        headers["X-RapidAPI-Key"] = JUDGE0_KEY

    data = {
        "source_code": code,
        "language_id": lang_id,
        "stdin": stdin or ""
    }

    # Submit code to Judge0
    try:
        submit_url = f"{JUDGE0_URL}/submissions/?base64_encoded=false&wait=false"
        resp = requests.post(submit_url, json=data, headers=headers)
        print("Judge0 submit response:", resp.status_code, resp.text)
    except Exception as e:
        yield f"Failed to submit code: {str(e)}".encode()
        return

    if resp.status_code not in (200, 201):
        yield b"Failed to submit code."
        return

    token = resp.json().get("token")
    if not token:
        yield b"Failed to submit code. No token received."
        return

    # Poll for result
    poll_url = f"{JUDGE0_URL}/submissions/{token}?base64_encoded=false"
    for _ in range(20):
        try:
            r = requests.get(poll_url, headers=headers)
            result = r.json()
        except Exception as e:
            yield f"Failed to fetch result: {str(e)}".encode()
            return

        status = result.get("status", {}).get("description")
        if status in ("Accepted", "Compilation Error", "Runtime Error (NZEC)", "Time Limit Exceeded"):
            output = (
                result.get("stdout") or
                result.get("compile_output") or
                result.get("stderr") or
                ""
            )
            yield output.encode()
            return
        time.sleep(1)
    yield b"Timed out waiting for result."
