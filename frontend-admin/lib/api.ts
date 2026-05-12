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
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
        return { error: 'Session expirée' };
      }
      const text = await res.text();
      return { error: `Erreur ${res.status}: ${text.substring(0, 50)}...` };
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await res.json();
    } else {
      const text = await res.text();
      return { error: `Réponse non-JSON: ${text.substring(0, 50)}...` };
    }
  } catch (err: any) {
    return { error: err.message };
  }
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