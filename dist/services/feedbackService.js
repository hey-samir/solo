"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedbackService = void 0;
const client_1 = __importDefault(require("../api/client"));
const react_hot_toast_1 = require("react-hot-toast");
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}
class FeedbackService {
    async getFeedback(sort = 'new') {
        try {
            const response = await client_1.default.get('/feedback', { params: { sort } });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching feedback:', error);
            const message = error.response?.data?.message || error.message || 'Failed to load feedback';
            throw new ApiError(message, error.response?.status);
        }
    }
    async submitFeedback(feedback) {
        try {
            const formData = new FormData();
            formData.append('title', feedback.title);
            formData.append('description', feedback.description);
            formData.append('category', feedback.category);
            if (feedback.screenshot) {
                formData.append('screenshot', feedback.screenshot);
            }
            const response = await client_1.default.post('/feedback', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            react_hot_toast_1.toast.success('Feedback submitted successfully!');
            return response.data;
        }
        catch (error) {
            console.error('Error submitting feedback:', error);
            const message = error.response?.data?.message || error.message || 'Failed to submit feedback';
            throw new ApiError(message, error.response?.status);
        }
    }
}
exports.feedbackService = new FeedbackService();
