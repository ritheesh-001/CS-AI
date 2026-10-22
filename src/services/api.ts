import axios from 'axios';

export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4500, // Short timeout so local mock fallback triggers swiftly when backend is not running
  headers: {
    'Content-Type': 'application/json',
  },
});
