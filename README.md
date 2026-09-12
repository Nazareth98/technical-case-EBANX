# EBANX Software Engineer Take-Home Assignment

A robust, simple, and scalable RESTful API built for the EBANX Software Engineer selection process. This application handles core banking operations including account balance retrieval, deposits, withdrawals, and transfers while maintaining strictly consistent in-memory state.

## 🛠️ Tech Stack & Tools

- **Node.js** & **TypeScript**
- **NestJS** (Modular framework for clean architecture and Dependency Injection)
- **Jest** & **Supertest** (Complete Unit and End-to-End integration test suite)
- **ngrok** (Exposing local server for automated external test suites)

---

## 🏛️ Architecture & Key Engineering Decisions

- **Domain-Driven & Layered Architecture:** Clear decoupling between the HTTP transport layer, use case orchestration, the data access abstraction, and rich domain logic.
- **Simplicity & KISS Principle:** Aligned with the spec's requirement, state persistence is managed in-memory via an injectable `Map<string, Account>` Singleton repository without adding unneeded database or ORM overhead.
- **Strict Atomicity & State Consistency:** Money transfers are fully atomic. If the source account does not exist or lacks sufficient funds, the operation aborts cleanly without mutating either source or destination state.
- **Side-Effect Free Reads:** The `GET /balance` endpoint strictly queries the state without instantiating missing entities or mutating existing data.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Installation

```bash
# Install dependencies
npm install
```

## Running the Application

```bash
# Start in development mode (default port: 3000)
npm run start:dev
```

The server will be available locally at `http://localhost:3000`.

## Exposing the API via ngrok (Step-by-Step)

To allow the automated tester (ipkss Tester) to reach your local NestJS server, you must expose your local port (3000) using ngrok.

### 1. Authenticate ngrok (First Time Only)

Add your ngrok Authtoken to your local configuration:

```bash
npx ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

_(Replace YOUR_AUTHTOKEN_HERE with your personal token from `dashboard.ngrok.com`)_

### 2. Start ngrok Tunnel

Start the tunnel to expose your local port 3000 to the internet:

```bash
npx ngrok http 3000
```

### 3. Get the Public URL

Once running, ngrok will display a forwarding URL in your terminal, typically looking like `https://your-random-string.ngrok-free.app`. Copy this URL.

## Running Tests

The test suite covers both unit domain rules and full End-to-End (E2E) state.

```bash
# Run unit tests
npm run test

# Run End-to-End (E2E) integration tests
npm run test:e2e

# Run tests with coverage report
npm run test:cov
```
