/**
 * Single place where the API base URL and the auth headers live.
 *
 * Previously every screen hardcoded `http://localhost:5000/...`, which meant
 * the app could not be pointed at a deployed backend without editing six
 * files, and no request ever sent an auth token.
 */
export const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const TOKEN_KEY = 'authToken';
export const EMAIL_KEY = 'userEmail';
export const ADMIN_TOKEN_KEY = 'adminToken';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const setCustomerSession = (token, email) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
};

export const clearCustomerSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
};

export const setAdminSession = (token) => localStorage.setItem(ADMIN_TOKEN_KEY, token);
export const clearAdminSession = () => localStorage.removeItem(ADMIN_TOKEN_KEY);

/**
 * Thin fetch wrapper: prefixes the base URL, sets the JSON content type,
 * attaches the right token, and turns a non-2xx response into a thrown Error
 * carrying the server's message.
 *
 * @param {string} path            e.g. '/api/foodData'
 * @param {object} [options]
 * @param {'none'|'user'|'admin'} [options.auth='none'] which token to attach
 */
export const apiFetch = async (path, { auth = 'none', headers = {}, ...options } = {}) => {
    const finalHeaders = { 'Content-Type': 'application/json', ...headers };

    if (auth === 'user') {
        const token = getAuthToken();
        if (token) finalHeaders['auth-token'] = token;
    } else if (auth === 'admin') {
        const token = getAdminToken();
        if (token) finalHeaders['admin-token'] = token;
    }

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers: finalHeaders });

    let payload = null;
    const text = await response.text();
    if (text) {
        try {
            payload = JSON.parse(text);
        } catch (parseError) {
            payload = { error: text };
        }
    }

    if (!response.ok) {
        // A 401 means the stored token is gone or expired — drop it so the UI
        // stops pretending the visitor is signed in.
        if (response.status === 401) {
            if (auth === 'user') clearCustomerSession();
            if (auth === 'admin') clearAdminSession();
        }

        const message =
            (payload && (payload.error || (payload.errors && payload.errors[0] && payload.errors[0].msg))) ||
            `Request failed with status ${response.status}`;

        const error = new Error(message);
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload;
};

export const apiGet = (path, opts) => apiFetch(path, { method: 'GET', ...opts });

export const apiPost = (path, body, opts) =>
    apiFetch(path, { method: 'POST', body: JSON.stringify(body ?? {}), ...opts });

export const apiPut = (path, body, opts) =>
    apiFetch(path, { method: 'PUT', body: JSON.stringify(body ?? {}), ...opts });

export const apiDelete = (path, opts) => apiFetch(path, { method: 'DELETE', ...opts });

/**
 * Downloads a binary response (the PDF receipt) and hands it to the browser as
 * a file. A plain <a href> cannot be used because the endpoint is behind an
 * auth header, so the bytes are fetched first and saved from a blob URL.
 *
 * @param {string} path      e.g. '/api/orders/MQY-…/receipt.pdf'
 * @param {string} filename  Suggested name for the saved file.
 * @param {'user'|'admin'} auth
 */
export const apiDownload = async (path, filename, auth = 'user') => {
    const headers = {};
    if (auth === 'user') {
        const token = getAuthToken();
        if (token) headers['auth-token'] = token;
    } else if (auth === 'admin') {
        const token = getAdminToken();
        if (token) headers['admin-token'] = token;
    }

    const response = await fetch(`${API_BASE}${path}`, { headers });

    if (!response.ok) {
        // The error path returns JSON even though the success path is a PDF.
        let message = `Request failed with status ${response.status}`;
        try {
            const payload = await response.json();
            message = payload.error || message;
        } catch (error) {
            /* keep the status-based message */
        }
        throw new Error(message);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Give the download a moment to start before revoking the URL.
    setTimeout(() => URL.revokeObjectURL(url), 2000);
};
