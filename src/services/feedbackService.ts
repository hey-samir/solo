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
      console.log('[FeedbackService] Fetching feedback with sort:', sort);
      const response = await client.get('/api/feedback', { params: { sort } });
      console.log('[FeedbackService] Received feedback response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[FeedbackService] Error fetching feedback:', error);
      const message = error.response?.data?.message || 'Failed to load feedback';
      toast.error(message);
      return [];  // Return empty array instead of throwing to prevent component crash
    }
  }

  async submitFeedback(feedback: FeedbackSubmission): Promise<FeedbackItem> {
    try {
      console.log('[FeedbackService] Submitting feedback:', feedback);
      const formData = new FormData();
      formData.append('title', feedback.title);
      formData.append('description', feedback.description);
      formData.append('category', feedback.category);

      if (feedback.screenshot) {
        formData.append('screenshot', feedback.screenshot);
      }

      const response = await client.post('/api/feedback', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('[FeedbackService] Feedback submission response:', response.data);
      toast.success('Feedback submitted successfully!');
      return response.data;
    } catch (error: any) {
      console.error('[FeedbackService] Error submitting feedback:', error);
      const message = error.response?.data?.message || 'Failed to submit feedback';
      toast.error(message);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();