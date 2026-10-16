# Full-Stack Calculator

A full-stack calculator application featuring a React + Vite frontend and an Express REST API backend.

---

## Setup Instructions

### Prerequisites

- **Node.js** (v18 or later)
- **npm** (v9 or later, with npm workspaces support)

### Installation

Install all dependencies across the root, backend, and frontend with a single command:

```bash
npm install
```

---

## How to Run

### Run Both Frontend & Backend (Recommended)

Start both servers concurrently with a single command:

```bash
npm start
# or: npm run dev
```

- **Backend API**: http://localhost:3000
- **Frontend App**: http://localhost:5173 (configured to proxy `/api` requests to port 3000)

### Run Individually

- **Backend only**:
  ```bash
  npm run start --workspace=backend
  # or: cd backend && npm start
  ```
- **Frontend only**:
  ```bash
  npm run dev --workspace=frontend
  # or: cd frontend && npm run dev
  ```

### Run Tests

Execute all unit and integration tests across both backend and frontend:

```bash
npm test
```

To run tests individually:

```bash
npm run test:backend   # 29 backend tests (Node test runner)
npm run test:frontend  # 22 frontend tests (Vitest + React Testing Library)
```

---

## API Documentation & Examples

All API responses are formatted in JSON.

### Supported Operations

- **Binary**: `add` (`+`), `subtract` (`−`), `multiply` (`×`), `divide` (`÷`), `power` (`^`), `percent` (`% of`)
- **Unary**: `sqrt` (`√`)

---

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

**Response (200 OK):**

```json
{
  "status": "ok"
}
```

---

### 2. List Supported Operations

```bash
curl http://localhost:3000/api/operations
```

**Response (200 OK):**

```json
{
  "operations": ["add", "subtract", "multiply", "divide", "power", "percent", "sqrt"]
}
```

---

### 3. Calculate (Binary Operation)

```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "add", "a": 12, "b": 8}'
```

**Response (200 OK):**

```json
{
  "result": 20
}
```

---

### 4. Calculate (Unary Operation: Square Root)

```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "sqrt", "a": 144}'
```

**Response (200 OK):**

```json
{
  "result": 12
}
```

---

### 5. Error Handling Examples

#### Division by Zero

```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "divide", "a": 10, "b": 0}'
```

**Response (400 Bad Request):**

```json
{
  "error": "Division by zero"
}
```

#### Negative Square Root

```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "sqrt", "a": -25}'
```

**Response (400 Bad Request):**

```json
{
  "error": "Square root of a negative number"
}
```

#### Non-numeric / Invalid Input

```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation": "add", "a": "invalid", "b": 10}'
```

**Response (400 Bad Request):**

```json
{
  "error": "'a' must be a finite number"
}
```

---

## Design Decisions & Assumptions

1. **Layered Backend Architecture (MVC)**
   - **Service Layer (`backend/services/calculator.js`)**: Pure mathematical core and domain validations. Independent of HTTP/Express; throws explicit `CalcError` instances for domain violations (e.g. division by zero, non-finite results).
   - **Controller Layer (`backend/controllers/calculatorController.js`)**: Handles HTTP requests, parameter extraction, and maps `CalcError` to HTTP 400 JSON responses.
   - **Routing Layer (`backend/routes/api.js`)**: Exposes REST endpoints mounted under `/api`.
   - **Application Core (`backend/app.js`)**: Configures CORS, sets body size limits (`1kb`), and returns JSON errors for all API routes.

2. **Frontend State & UI Separation**
   - **State Machine Hook (`frontend/src/useCalculator.ts`)**: Custom React hook encapsulating operand tracking, queued operations, decimal handling, sign inversion, and unified backend API communication (`runApi`). Keeps business logic decoupled from JSX.
   - **Component Presentation (`frontend/src/App.tsx`)**: Renders the digital display and keypad. Uses a clean declarative button array and a keymap lookup table for keyboard shortcuts instead of long `if/else if` chains.
   - **In-Display Error Presentation**: Rather than intrusive modal popups, API errors returned by the server are rendered directly in the calculator display (`error ?? display`).

3. **npm Workspaces & Concurrency**
   - Uses native `npm workspaces` for monorepo dependency management so `npm install` handles both projects together.
   - Utilizes `concurrently` to stream logs from both Express and Vite side-by-side during development.

---

## AI Prompts Used

1. **Test Suite Generation (Backend & Frontend)**

   > _"Generate comprehensive unit and integration tests for both the backend (testing operations, domain edge cases, and REST endpoints) and frontend (testing the state hook, UI keypad interactions, and live API integration)."_

2. **Calculator UI Design & Styling**

   > _"Redesign the frontend to look like a handheld calculator: include a 10-digit numpad grid, operation controls, and a digital display screen showing intermediate expressions and final results."_

3. **Code Redundancy Audit & Simplification**

   > _"Using the ponytail skill, simplify the frontend to remove redundant code and repetitive chains, keeping every file under 150 lines while preserving readability and functionality."_

4. **Logic Verification & Edge Case Auditing**

   > _"Verify calculation logic and error handling across both layers: ensure domain errors (division by zero, negative square roots, invalid inputs) are enforced on the backend and surfaced cleanly in the UI display."_

5. **Project Orchestration & Documentation**

   > _"Configure npm workspaces and a single-command runner for both services, then draft a README with setup, run instructions, REST API examples, and design decisions."_
