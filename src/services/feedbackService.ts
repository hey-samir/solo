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

class FeedbackService {
  async getFeedback(sort: 'new' | 'top' = 'new'): Promise<FeedbackItem[]> {
    try {
      const response = await client.get('/feedback', { params: { sort } });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback. Please try again.');
      throw error;
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
      toast.error('Failed to submit feedback. Please try again.');
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();
