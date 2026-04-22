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

## Key features

* Getting all customer via GET /customers
  * Lists all customers with id, name, role, e-mail, phone, contacted
* Get single customer via GET /customers/{id}
  * Returns 404 when not found
* Creating customer via POST /customers
  * Name is required
  * Id will be generated, not allowed to pass it
* Update a single user via PUT /customers/{id}
  * Returns 404 when not found
  * Returns 400 when name is set to empty
* Delete a single user via DELETE /customers/{id}
  * Returns 404 when not found
  * Returns 204 when successful