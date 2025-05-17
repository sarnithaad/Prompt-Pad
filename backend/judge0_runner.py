import requests
import os
import time

JUDGE0_URL = os.getenv("JUDGE0_URL", "https://ce.judge0.com")

LANGUAGE_MAP = {
    "python": 71,
    "c": 50,
    "cpp": 54,
    "java": 62,
    "csharp": 51,
    "cs": 51,
    "javascript": 63,
    "js": 63
}

def run_code_in_judge0(code, stdin, language):
    lang_id = LANGUAGE_MAP.get(language.lower())
    if not lang_id:
        yield b"Unsupported language."
        return

    headers = {
        "Content-Type": "application/json"
        "X-RapidAPI-Host": "ce.judge0.com"
    }

    data = {
        "source_code": code,
        "language_id": lang_id,
        "stdin": stdin or ""
    }

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

    poll_url = f"{JUDGE0_URL}/submissions/{token}?base64_encoded=false"
    for i in range(20):
        try:
            r = requests.get(poll_url, headers=headers)
            result = r.json()
            print(f"Judge0 poll attempt {i+1}: {r.status_code} {result}")
        except Exception as e:
            yield f"Failed to fetch result: {str(e)}".encode()
            return

        status = result.get("status", {}).get("description")
        if status in (
            "Accepted",
            "Compilation Error",
            "Runtime Error (NZEC)",
            "Time Limit Exceeded",
            "Internal Error"
        ):
            output = (
                result.get("stdout") or
                result.get("compile_output") or
                result.get("stderr") or
                result.get("message") or
                ""
            )
            yield output.encode()
            return
        time.sleep(1)
    yield b"Timed out waiting for result."
