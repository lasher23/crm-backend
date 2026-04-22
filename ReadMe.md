# CRM Backend

A simple REST API for managing customers. Built with Go and Gorilla Mux.

**Features:**
- Get all customers or a single one by ID
- Add, update, and delete customers
- In-memory storage (no database needed)

**Dependencies:**
- For Method based HTTP routing: https://github.com/gorilla/mux
- For UUID generation: https://github.com/google/uuid
## Getting started

Install dependencies:

```bash
go mod download
```

Run the server:

```bash
go run .
```

Server starts on `http://localhost:3003`. Check `examples.http` for ready-to-use requests.
