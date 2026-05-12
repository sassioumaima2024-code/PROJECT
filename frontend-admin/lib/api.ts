const API_URL = 'http://localhost:8000/api';

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function apiGet(endpoint: string) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json();
}

export async function apiPatch(endpoint: string, data: object) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDelete(endpoint: string) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.json();
}