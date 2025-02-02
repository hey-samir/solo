import client from '../api/client';
import { toast } from 'react-hot-toast';

export interface FeedbackItem {
  id: number;
  title: string;
  description: string;
  category: string;
  screenshot_url?: string;
  created_at: string;
  user: {
    username: string;
  };
}

export interface FeedbackSubmission {
  title: string;
  description: string;
  category: string;
  screenshot?: File;
}

class ApiError extends Error {
  status?: number;
  data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class FeedbackService {
  async getFeedback(sort: 'new' | 'top' = 'new'): Promise<FeedbackItem[]> {
    try {
      const response = await client.get('/feedback', { params: { sort } });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      const message = error.response?.data?.message || error.message || 'Failed to load feedback';
      throw new ApiError(message, error.response?.status);
    }
  }

  async submitFeedback(feedback: FeedbackSubmission): Promise<FeedbackItem> {
    try {
      const formData = new FormData();
      formData.append('title', feedback.title);
      formData.append('description', feedback.description);
      formData.append('category', feedback.category);
      if (feedback.screenshot) {
        formData.append('screenshot', feedback.screenshot);
      }

      const response = await client.post('/feedback', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Feedback submitted successfully!');
      return response.data;
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      const message = error.response?.data?.message || error.message || 'Failed to submit feedback';
      throw new ApiError(message, error.response?.status);
    }
  }
}

export const feedbackService = new FeedbackService();