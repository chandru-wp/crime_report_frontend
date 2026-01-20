// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

console.log('Using API:', API_BASE_URL);
export default API_BASE_URL;
