import docker
import os
import shutil
import tempfile

LANG_CONFIG = {
    "python": {
        "image": "python:3.10-slim",
        "file": "main.py",
        "compile": None,
        "run": "python main.py"
    },
    "c": {
        "image": "gcc:latest",
        "file": "main.c",
        "compile": "gcc main.c -o main.out",
        "run": "./main.out"
    },
    "cpp": {
        "image": "gcc:latest",
        "file": "main.cpp",
        "compile": "g++ main.cpp -o main.out",
        "run": "./main.out"
    },
    "java": {
        "image": "openjdk:17-slim",
        "file": "Main.java",
        "compile": "javac Main.java",
        "run": "java Main"
    },
    "csharp": {
        "image": "mcr.microsoft.com/dotnet/sdk:8.0",
        "file": "Program.cs",
        "compile": "dotnet build -o out",
        "run": "dotnet out/Program.dll"
    },
    "javascript": {
        "image": "node:20-slim",
        "file": "main.js",
        "compile": None,
        "run": "node main.js"
    }
}

def run_code_in_docker(code, user_input, language):
    config = LANG_CONFIG.get(language.lower())
    if not config:
        yield f"Language {language} not supported."
        return

    try:
        client = docker.from_env()
    except Exception as e:
        yield f"Error: Docker is not available: {str(e)}"
        return

    temp_dir = tempfile.mkdtemp(prefix="promptpad_")
    code_file = os.path.join(temp_dir, config["file"])
    with open(code_file, "w") as f:
        f.write(code)
    input_file = os.path.join(temp_dir, "input.txt")
    with open(input_file, "w") as f:
        f.write(user_input or "")

    try:
        volumes = {temp_dir: {"bind": "/code", "mode": "rw"}}
        commands = []

        # For C#, ensure csproj is present and project is initialized
        if language.lower() == "csharp":
            csproj_file = os.path.join(temp_dir, "Program.csproj")
            with open(csproj_file, "w") as f:
                f.write("""
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
</Project>
""")
            commands.append("dotnet new console -o . --force")

        if config["compile"]:
            commands.append(config["compile"])

        if user_input:
            run_cmd = f"bash -c 'cat input.txt | {config['run']}'"
        else:
            run_cmd = config["run"]
        commands.append(run_cmd)
        full_cmd = " && ".join(commands)

        container = client.containers.run(
            image=config["image"],
            command=full_cmd,
            working_dir="/code",
            volumes=volumes,
            stdin_open=True,
            detach=True,
            tty=False,
            mem_limit="256m",
            network_disabled=True,
            remove=True,
        )
        logs = container.logs(stream=True)
        for line in logs:
            yield line.decode(errors="ignore")
    except docker.errors.ContainerError as e:
        yield f"Error: {getattr(e, 'stderr', b'').decode(errors='ignore')}"
    except Exception as e:
        yield f"Error: {str(e)}"
    finally:
        try:
            shutil.rmtree(temp_dir)
        except Exception:
            pass
