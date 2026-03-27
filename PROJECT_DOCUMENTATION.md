# Online Compiler — Project Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technologies Used](#2-technologies-used)
3. [Architecture Design](#3-architecture-design)
4. [Directory Structure](#4-directory-structure)
5. [Backend — Deep Dive](#5-backend--deep-dive)
6. [Frontend — Deep Dive](#6-frontend--deep-dive)
7. [Docker Execution Layer](#7-docker-execution-layer)
8. [API Reference](#8-api-reference)
9. [Data Flow](#9-data-flow)
10. [Setup & Running the Project](#10-setup--running-the-project)
11. [Key Design Decisions](#11-key-design-decisions)
12. [Deployment Considerations](#12-deployment-considerations)

---

## 1. Project Overview

**Online Compiler** is a browser-based code editor and executor that lets users write, run, and see the output of programs in multiple programming languages — without installing anything locally.

| Feature | Details |
|---|---|
| Supported languages | C++, Python, Java, JavaScript |
| Code input | Monaco Editor (VS Code's editor engine) |
| Standard input | Textarea supplied by the user |
| Code execution | Isolated Docker containers |
| Output display | Real-time result rendered in the browser |
| Authentication | None — fully public |
| Persistence | None — completely stateless |

---

## 2. Technologies Used

### 2.1 Frontend

| Technology | Version | Role |
|---|---|---|
| **React** | 19.2.0 | UI component framework |
| **TypeScript** | ~5.9.3 | Static typing for all frontend code |
| **Vite** | 7.2.2 | Development server & production bundler |
| **Monaco Editor** | 0.54.0 | Code editor (same engine as VS Code) |
| **@monaco-editor/react** | 4.7.0 | React wrapper for Monaco Editor |
| **ESLint** | 9.39.1 | Linting and code-quality enforcement |
| **Fetch API** | Browser built-in | HTTP requests to the backend |

### 2.2 Backend

| Technology | Version | Role |
|---|---|---|
| **Node.js** | LTS | Server-side JavaScript runtime |
| **Express** | 5.1.0 | HTTP web framework & routing |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing middleware |
| **child_process** (`exec`) | Node.js built-in | Spawning Docker containers |
| **fs** | Node.js built-in | Temporary file I/O |
| **path** | Node.js built-in | File path resolution |

### 2.3 Containerisation / Execution Layer

| Image name | Base image | Language |
|---|---|---|
| `cpp-compiler` | `alpine:latest` | C++ (g++) |
| `python-compiler` | `python:3.11-slim` | Python 3.11 |
| `java-compiler` | `openjdk:26-ea-slim` | Java (javac + java) |
| `javascript-compiler` | `node:latest` | JavaScript (Node.js) |

---

## 3. Architecture Design

### 3.1 High-Level Overview

The project follows a **Three-Tier Client-Server Architecture** with an additional isolated execution layer powered by Docker.

```
┌──────────────────────────────────────────────────────────────┐
│                      BROWSER (Client)                        │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  React + TypeScript (Vite)                          │   │
│   │  ┌──────────────┐  ┌──────────────────────────────┐│   │
│   │  │   Navbar     │  │      CodeEditor              ││   │
│   │  │  (branding)  │  │  Monaco Editor  |  Output    ││   │
│   │  └──────────────┘  │  Language Sel.  |  Panel     ││   │
│   │                    │  Run Button     |            ││   │
│   │                    │  Input Textarea |            ││   │
│   │                    └──────────────────────────────┘│   │
│   └─────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────┘
                             │  HTTP POST  /run/{language}
                             │  Body: { code, input }
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                   BACKEND SERVER (Node.js)                   │
│                       Port 8080                              │
│                                                              │
│   Express App                                                │
│   ┌──────────────────────────────────────────────────────┐  │
│   │  Middleware: CORS (origin: *) · JSON body parser     │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
│   Router  /run                                               │
│   ┌────────────────────────────────┐                        │
│   │ POST /run/cpp        ──────────┼──► cpp_service.js      │
│   │ POST /run/python     ──────────┼──► python_service.js   │
│   │ POST /run/java       ──────────┼──► java_service.js     │
│   │ POST /run/javascript ──────────┼──► javascript_service  │
│   └────────────────────────────────┘                        │
│                                                              │
│   Each service:                                              │
│    1. Writes code → user_code.<ext>                          │
│    2. Writes stdin → input.txt                               │
│    3. Runs Docker container (volume-mounted)                 │
│    4. Captures stdout / stderr                               │
│    5. Deletes temporary files                                │
│    6. Returns JSON response                                  │
└────────────────────────────┬─────────────────────────────────┘
                             │  docker run --rm -v ...
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                EXECUTION LAYER (Docker)                      │
│                                                              │
│  ┌────────────────┐  ┌──────────────────┐                   │
│  │ cpp-compiler   │  │ python-compiler  │                   │
│  │ Alpine + g++   │  │ Python 3.11-slim │                   │
│  └────────────────┘  └──────────────────┘                   │
│  ┌────────────────┐  ┌──────────────────┐                   │
│  │ java-compiler  │  │javascript-compiler│                  │
│  │ OpenJDK 26     │  │ Node.js latest   │                   │
│  └────────────────┘  └──────────────────┘                   │
│                                                              │
│  Each container:                                             │
│   • Shares /usr/src/app via volume mount (read/write)        │
│   • Compiles and/or executes user_code.<ext>                 │
│   • Reads stdin from input.txt                               │
│   • Removed after execution (--rm flag)                      │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Security Isolation

Every code-execution request runs inside an **ephemeral Docker container**:

- The container is destroyed immediately after execution (`--rm`).
- Only the service directory is mounted; the rest of the host filesystem is inaccessible.
- No network access is granted to the container (default Docker behaviour with no published ports).
- Output is capped to whatever Docker's default pipe buffer holds.

---

## 4. Directory Structure

```
online_compiler/
├── PROJECT_DOCUMENTATION.md      ← this file
├── README.md
│
├── backend/                       Node.js / Express server
│   ├── package.json
│   ├── index.js                   Server entry point
│   ├── routes/
│   │   └── run_code_route.js      Route definitions (/run/*)
│   └── services/                  Execution logic per language
│       ├── cpp_service.js
│       ├── python_service.js
│       ├── java_service.js
│       └── javascript_service.js
│
├── frontend/                      React + TypeScript SPA
│   ├── index.html                 HTML shell
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── eslint.config.js
│   └── src/
│       ├── main.tsx               React DOM entry point
│       ├── App.tsx                Root component
│       ├── App.css
│       ├── index.css
│       └── component/
│           ├── navbar.tsx         Header / branding
│           └── code_editor.tsx    Main editor + output UI
│
└── dockerFiles/                   Dockerfiles for each language
    ├── cppDocker/
    │   └── Dockerfile
    ├── pythonDocker/
    │   └── Dockerfile
    ├── javaDocker/
    │   └── Dockerfile
    └── javascriptDocker/
        └── Dockerfile
```

---

## 5. Backend — Deep Dive

### 5.1 Server Entry Point (`backend/index.js`)

```
Express App
  ├── cors({ origin: "*" })       Allow requests from any origin
  ├── express.json()              Parse JSON request bodies
  └── app.use("/run", router)     Mount language routes
```

The server listens on `process.env.PORT` (defaults to `8080`).

### 5.2 Routes (`backend/routes/run_code_route.js`)

| Method | Path | Handler |
|---|---|---|
| POST | `/run/cpp` | `run_cpp` (cpp_service) |
| POST | `/run/python` | `run_python` (python_service) |
| POST | `/run/java` | `run_java` (java_service) |
| POST | `/run/javascript` | `run_javascript` (javascript_service) |

### 5.3 Service Pattern (all four services follow this pattern)

Each service is a self-contained module that:

1. **Receives** `{ code, input }` from the request body.
2. **Resolves** its own directory path with `path.resolve(__dirname)`.
3. **Writes** the source code to a temporary file (e.g. `user_code.cpp`).
4. **Writes** the stdin payload to `input.txt`.
5. **Executes** a `docker run` command via Node.js `child_process.exec`:
   ```
   docker run --rm \
     -v "<service_dir>:/usr/src/app" \
     <image-name>
   ```
6. **Captures** `stdout` (program output) and `stderr` (errors).
7. **Cleans up** all temporary files regardless of success or failure.
8. **Responds** with:
   - `{ output: <stdout> }` on success
   - `{ error: <stderr> }` on failure

### 5.4 Language-Specific Notes

| Language | Source file | Compile command | Run command |
|---|---|---|---|
| C++ | `user_code.cpp` | `g++ -o output user_code.cpp` | `./output < input.txt` |
| Python | `user_code.py` | *(none — interpreted)* | `python user_code.py < input.txt` |
| Java | `user_code.java` | `javac user_code.java` | `java user_code < input.txt` |
| JavaScript | `user_code.js` | *(none — interpreted)* | `node user_code.js < input.txt` |

> **Note for Java:** The public class inside the Java source code must be named `user_code` to match the filename required by `javac`.

---

## 6. Frontend — Deep Dive

### 6.1 Component Tree

```
App
├── Navbar          Static header with "Online Compiler" title
└── CodeEditor      All interactive logic lives here
```

### 6.2 `CodeEditor` Component (`src/component/code_editor.tsx`)

#### State

| State variable | Type | Purpose |
|---|---|---|
| `language` | `string` | Currently selected language |
| `code` | `string` | Source code in the editor |
| `inputValue` | `string` | Content of the stdin textarea |
| `output` | `string` | Result text shown in the output panel |
| `isRunning` | `boolean` | Disables Run button while waiting for response |

#### Default Code Templates

Each language has a default "Hello, World!" template that loads automatically when the language is changed.

| Language | Template class / entry point |
|---|---|
| C++ | `main()` using `#include <bits/stdc++.h>` |
| Python | `print("Hello World")` |
| Java | `public class user_code` with `main()` |
| JavaScript | `console.log("Hello World")` |

#### UI Layout

```
┌─────────────────────────────────────────────────────┐
│  Language dropdown  │  File Upload button  │  Run   │
├───────────────────────────────────┬─────────────────┤
│                                   │                 │
│         Monaco Editor             │  Output Panel   │
│         (flex: 1)                 │  (400 px fixed) │
│                                   │                 │
├───────────────────────────────────┴─────────────────┤
│  Input  textarea                                    │
└─────────────────────────────────────────────────────┘
```

#### Run Button Flow

```
onClick (Run)
  → isRunning = true
  → fetch POST http://localhost:8080/run/{language}
      body: { code, input: inputValue }
  → await response.json()
  → if result.output  → output = result.output
  → if result.error   → output = result.error
  → isRunning = false
```

#### File Upload

A hidden `<input type="file">` element is triggered by a styled button. When a file is selected, its text content is read with the `FileReader` API and placed into the Monaco Editor.

### 6.3 Build Configuration

- **Vite** is used instead of Create React App for significantly faster HMR and build times.
- TypeScript is compiled via Vite's built-in `esbuild` transform.
- The production bundle is output to `frontend/dist/`.

---

## 7. Docker Execution Layer

### 7.1 C++ (`dockerFiles/cppDocker/Dockerfile`)

```dockerfile
FROM alpine:latest
RUN apk add --no-cache g++ libstdc++
WORKDIR /usr/src/app
CMD ["sh", "-c", "g++ -o output user_code.cpp && ./output < input.txt"]
```

- Smallest image (~50–100 MB) thanks to Alpine Linux.
- No additional dependencies needed for standard C++ programs.

### 7.2 Python (`dockerFiles/pythonDocker/Dockerfile`)

```dockerfile
FROM python:3.11-slim
WORKDIR /usr/src/app
CMD ["sh", "-c", "python user_code.py < input.txt"]
```

- Uses the slim variant to keep the image size small.
- Supports the full Python 3.11 standard library.

### 7.3 Java (`dockerFiles/javaDocker/Dockerfile`)

```dockerfile
FROM openjdk:26-ea-slim
WORKDIR /usr/src/app
CMD ["sh", "-c", "javac user_code.java && java user_code < input.txt"]
```

- Uses an early-access OpenJDK 26 slim image.
- Compile + run steps are chained; if `javac` fails, output goes to stderr.

### 7.4 JavaScript (`dockerFiles/javascriptDocker/Dockerfile`)

```dockerfile
FROM node:latest
WORKDIR /usr/src/app
CMD ["sh", "-c", "node user_code.js < input.txt"]
```

- Uses the official latest Node.js image.
- No compilation step required.

### 7.5 Volume Mount

The service directory on the host is bind-mounted into `/usr/src/app` inside the container:

```
docker run --rm -v "/absolute/path/to/services:/usr/src/app" <image>
```

This means the container reads `user_code.*` and `input.txt` directly from the host filesystem without any copying, which keeps execution fast.

---

## 8. API Reference

### Base URL

```
http://localhost:8080
```

### Endpoints

All four endpoints share the same request and response schema.

#### `POST /run/cpp`
#### `POST /run/python`
#### `POST /run/java`
#### `POST /run/javascript`

**Request Body**

```json
{
  "code": "<source code as a string>",
  "input": "<optional stdin as a string>"
}
```

**Success Response — HTTP 200**

```json
{
  "output": "<program stdout>"
}
```

**Error Response — HTTP 400**

```json
{
  "error": "<compiler / runtime error message>"
}
```

**Example — Python**

```bash
curl -X POST http://localhost:8080/run/python \
  -H "Content-Type: application/json" \
  -d '{"code": "name = input()\nprint(f\"Hello, {name}!\")", "input": "World"}'
```

```json
{ "output": "Hello, World!\n" }
```

**Example — C++**

```bash
curl -X POST http://localhost:8080/run/cpp \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n  int n; cin>>n; cout<<n*2;\n}",
    "input": "21"
  }'
```

```json
{ "output": "42" }
```

---

## 9. Data Flow

The complete lifecycle of a single code-execution request:

```
1.  USER types code and optional stdin in the browser.

2.  USER clicks "Run".

3.  FRONTEND sets isRunning=true and sends:
      POST /run/python
      { "code": "print('hi')", "input": "" }

4.  BACKEND (Express) receives the request.
      → Routes to python_service.js

5.  python_service.js writes files to disk:
      /backend/services/user_code.py   ← code
      /backend/services/input.txt      ← input

6.  python_service.js executes:
      docker run --rm \
        -v "/backend/services:/usr/src/app" \
        python-compiler

7.  DOCKER CONTAINER starts:
      sh -c "python user_code.py < input.txt"
      → stdout: "hi\n"
      → stderr: ""
      → Container exits and is removed (--rm)

8.  python_service.js receives stdout/stderr from exec callback.
      → Deletes user_code.py and input.txt

9.  BACKEND responds:
      HTTP 200  { "output": "hi\n" }

10. FRONTEND receives the response.
      → Sets output = "hi\n"
      → Sets isRunning = false
      → Output panel renders: "hi"
```

---

## 10. Setup & Running the Project

### Prerequisites

| Requirement | Notes |
|---|---|
| **Docker** | Must be installed and the daemon running |
| **Node.js** (LTS) | npm is included |
| Port **8080** | Used by the backend |
| Port **5173** | Default Vite dev server port |

### Step 1 — Build Docker Images

```bash
cd online_compiler/dockerFiles

docker build -t cpp-compiler          cppDocker/
docker build -t python-compiler       pythonDocker/
docker build -t java-compiler         javaDocker/
docker build -t javascript-compiler   javascriptDocker/
```

### Step 2 — Start the Backend

```bash
cd online_compiler/backend
npm install
node index.js
# → Listening on port 8080
```

### Step 3 — Start the Frontend (Development)

```bash
cd online_compiler/frontend
npm install
npm run dev
# → http://localhost:5173
```

### Step 4 — Build Frontend for Production

```bash
cd online_compiler/frontend
npm run build       # Output: frontend/dist/
npm run preview     # Serve the production build locally
```

### Step 5 — Linting

```bash
cd online_compiler/frontend
npm run lint
```

---

## 11. Key Design Decisions

| Decision | Rationale | Trade-off |
|---|---|---|
| **Docker for execution** | Security isolation; user code cannot affect the host | Container startup adds latency (~200–500 ms) |
| **Ephemeral containers (`--rm`)** | No container accumulation; clean state per run | Cold start for every request |
| **Temporary files on disk** | Simple inter-process communication between Node and Docker via volume mount | File I/O overhead; **no locking or unique naming** is implemented — concurrent requests to the same language endpoint will overwrite each other's `user_code.*` and `input.txt` files, causing incorrect output. For production use, each request should write to a uniquely named temporary directory (e.g. using a UUID). |
| **Stateless backend** | Simple architecture; easy horizontal scaling | No code history or user sessions |
| **CORS `origin: "*"`** | Allows any frontend origin during development | Should be restricted in production |
| **Monaco Editor** | Professional editing experience with syntax highlighting, IntelliSense, and themes | Adds ~2–3 MB to the frontend bundle |
| **Vite instead of CRA** | Significantly faster HMR and build times; native ESM support | Requires ES module knowledge; slightly different config from CRA |
| **TypeScript on the frontend only** | Type safety where the complexity is highest (UI state, API types) | Backend remains plain JavaScript |
| **No database** | Simplifies deployment and maintenance | Cannot persist code snippets, history, or user preferences |

---

## 12. Deployment Considerations

### 12.1 Security Hardening

- **Restrict CORS** — Replace `origin: "*"` with the production frontend domain.
- **Execution timeouts** — Add a timeout flag to `docker run` (e.g. `--stop-timeout 10`) or wrap `exec` with a timeout to prevent infinite loops.
- **Resource limits** — Use `--memory` and `--cpus` flags on `docker run` to prevent a single request from starving the host.
- **Network isolation** — Run containers with `--network none` to block outbound network calls from user code.
- **Input validation** — Validate and sanitise `code` and `input` fields before writing them to disk.

### 12.2 Scalability

- **Job queue** — Offload container execution to an async queue (e.g. BullMQ + Redis) so the HTTP response is not blocked waiting for the container to finish.
- **Horizontal scaling** — Multiple backend instances behind a load balancer; each needs access to Docker.
- **Container warm-up** — Keep pre-started containers for each language to eliminate cold-start latency.

### 12.3 Frontend

- **Externalise the API URL** — Move `http://localhost:8080` to an environment variable (`VITE_API_URL`) so it can be configured at build time.
- **Code splitting** — Lazy-load the Monaco Editor to reduce initial bundle size.

### 12.4 Monitoring

- Add structured logging (e.g. Winston or Pino) to the backend.
- Expose a `/health` endpoint for uptime checks.
- Track container execution time and error rates.

---

*This document covers the full architecture, technology stack, and operational knowledge of the Online Compiler project.*
