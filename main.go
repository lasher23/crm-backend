package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

const (
	id1 = "550e8400-e29b-41d4-a716-446655440001"
	id2 = "550e8400-e29b-41d4-a716-446655440002"
	id3 = "550e8400-e29b-41d4-a716-446655440003"
)

var customers = map[string]Customer{
	id1: {
		ID:        id1,
		Name:      "Max Muster",
		Role:      "Manager",
		Email:     "max.muster@example.com",
		Phone:     41796541522,
		Contacted: true,
	},
	id2: {
		ID:        id2,
		Name:      "John Doe",
		Role:      "Marketing Specialist",
		Email:     "john.doe@example.com",
		Phone:     41796541523,
		Contacted: true,
	},
	id3: {
		ID:        id3,
		Name:      "Jane Doe",
		Role:      "CEO",
		Email:     "Jane.doe@example.com",
		Phone:     41796541524,
		Contacted: false,
	},
}

type Customer struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Role      string `json:"role"`
	Email     string `json:"email"`
	Phone     int    `json:"phone"`
	Contacted bool   `json:"contacted"`
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/customers", getCustomers).Methods("GET")
	router.HandleFunc("/customers/{id}", getCustomer).Methods("GET")
	router.HandleFunc("/customers", addCustomer).Methods("POST")
	router.HandleFunc("/customers/{id}", updateCustomer).Methods("PUT")
	router.HandleFunc("/customers/{id}", deleteCustomer).Methods("DELETE")

	fmt.Println("Server is starting on port 3003...")
	err := http.ListenAndServe(":3003", router)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}

func getCustomers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(customers)
}
func getCustomer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	customer, exists := customers[id]
	if !exists {
		http.Error(w, "customer not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(customer)
}
func addCustomer(w http.ResponseWriter, r *http.Request) {
	newCustomer := Customer{}
	json.NewDecoder(r.Body).Decode(&newCustomer)
	if newCustomer.ID != "" {
		http.Error(w, "id must not be provided and will be generated automatically", http.StatusBadRequest)
		return
	}
	if newCustomer.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	newCustomer.ID = uuid.NewString()
	customers[newCustomer.ID] = newCustomer
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newCustomer)
}
func updateCustomer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, exists := customers[id]
	if !exists {
		http.Error(w, "customer not found", http.StatusNotFound)
		return
	}
	customer := Customer{}
	json.NewDecoder(r.Body).Decode(&customer)
	if customer.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}
	customer.ID = id
	customers[id] = customer
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(customer)
}
func deleteCustomer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, exists := customers[id]
	if !exists {
		http.Error(w, "customer not found", http.StatusNotFound)
		return
	}
	delete(customers, id)
	w.WriteHeader(http.StatusNoContent)
}
