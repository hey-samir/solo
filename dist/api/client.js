"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const react_hot_toast_1 = require("react-hot-toast");
const client = axios_1.default.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});
// Simple request interceptor
client.interceptors.request.use((config) => {
    console.log('Request:', config.method?.toUpperCase(), config.url);
    return config;
}, (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
});
// Simple response interceptor
client.interceptors.response.use((response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
}, (error) => {
    console.error('Response Error:', error.message);
    if (!error.response) {
        react_hot_toast_1.toast.error('Network error. Please check your connection.');
        return Promise.reject(error);
    }
    const message = error.response?.data?.error || 'An unexpected error occurred';
    react_hot_toast_1.toast.error(message);
    return Promise.reject(error);
});
exports.default = client;
