const API_BASE = 'http://127.0.0.1:8001';

export const API = {
  BASE: API_BASE,
  LOGIN: `${API_BASE}/login`,
  SIGNUP: `${API_BASE}/signup`,
  CHAT: `${API_BASE}/chat`,
  CHAT_HISTORY: `${API_BASE}/chat/history`,
  SUBMIT_QUIZ: `${API_BASE}/submit-quiz`,
  CHECK_COLLEGE: `${API_BASE}/check_college`,
  ME: `${API_BASE}/me`,
  CAREER_TREE: `${API_BASE}/career-tree`,
  ADMIN_CAREER_NODES: `${API_BASE}/admin/career-nodes`,
  RAG_UPLOAD: `${API_BASE}/rag/upload`,
  RAG_CHAT: `${API_BASE}/rag/chat`,
  RAG_DOCUMENTS: `${API_BASE}/rag/documents`,
  RAG_DELETE_DOC: (docId: string) => `${API_BASE}/rag/documents/${docId}`,
};

function getToken(): string | null {
  try { return localStorage.getItem('token'); } catch { return null; }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

function headers(hasJsonBody: boolean): Record<string, string> {
  const h: Record<string, string> = {};
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (hasJsonBody) h['Content-Type'] = 'application/json';
  return h;
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPostFormData<T>(url: string, formData: FormData): Promise<T> {
  const h: Record<string, string> = {};
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: h,
    body: formData,
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: headers(false),
  });
  return handleResponse<T>(res);
}

export async function apiGet<T>(url: string, params?: Record<string, string | number>): Promise<T> {
  const qs = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  const res = await fetch(url + qs, {
    headers: headers(false),
  });
  return handleResponse<T>(res);
}
