const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
    private getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async get(endpoint: string) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        return response.json();
    }

    async post(endpoint: string, data: any) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async put(endpoint: string, data: any) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    }

    async patch(endpoint: string, data: any) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
        return response.json();
    }
}

export default new ApiService();
