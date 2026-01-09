const API_URL = 'http://localhost/IT Inventory/backend/api';

export const api = {
    login: async (username, password) => {
        const response = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    },

    getStats: async () => {
        const response = await fetch(`${API_URL}/stats.php`);
        return response.json();
    },

    getInventory: async () => {
        const response = await fetch(`${API_URL}/inventory.php`);
        return response.json();
    },

    getAssignments: async () => {
        const response = await fetch(`${API_URL}/assignments.php`);
        return response.json();
    },

    getLicenses: async () => {
        const response = await fetch(`${API_URL}/licenses.php`);
        return response.json();
    },

    getNetwork: async () => {
        const response = await fetch(`${API_URL}/network.php`);
        return response.json();
    },

    getTutorials: async () => {
        const response = await fetch(`${API_URL}/tutorials.php`);
        return response.json();
    },

    getUsers: async () => {
        const response = await fetch(`${API_URL}/users.php`);
        return response.json();
    },

    delete: async (endpoint, id) => {
        const response = await fetch(`${API_URL}/${endpoint}.php?id=${id}`, {
            method: 'DELETE',
        });
        return response.json();
    },

    update: async (endpoint, id, data) => {
        const response = await fetch(`${API_URL}/${endpoint}.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};
