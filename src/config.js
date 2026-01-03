// API Configuration based on environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000'
  : 'https://crime-report-backend-t9qq.onrender.com';

console.log('Using API:', API_BASE_URL);
export default API_BASE_URL;
