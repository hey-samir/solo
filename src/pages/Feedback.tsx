import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import client from '../api/client';

interface FeedbackItem {
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

interface FeedbackForm {
  title: string;
  description: string;
  category: string;
  screenshot?: File;
}

const categories = [
  'Bug Report',
  'Feature Request',
  'User Experience',
  'Performance Issue',
  'Other'
];

const Feedback: React.FC = () => {
  const [sort, setSort] = useState<'new' | 'top'>('new');
  const [form, setForm] = useState<FeedbackForm>({
    title: '',
    description: '',
    category: '',
  });

  const { data: feedbackItems, refetch } = useQuery<FeedbackItem[]>({
    queryKey: ['feedback', sort],
    queryFn: async () => {
      const response = await client.get(`/api/feedback?sort=${sort}`);
      return response.data;
    }
  });

  const submitFeedback = useMutation({
    mutationFn: async (formData: FormData) => {
      return await client.post('/api/feedback', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      setForm({
        title: '',
        description: '',
        category: '',
      });
      refetch();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('category', form.category);
    if (form.screenshot) {
      formData.append('screenshot', form.screenshot);
    }
    submitFeedback.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, screenshot: file }));
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-4 mb-4">
        <div className="card bg-dark">
          <div className="card-body">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-3">
                <label className="form-label required-field">Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Short, descriptive title"
                  required
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="mb-3">
                <label className="form-label required-field">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Detailed description of your feedback"
                  required
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="mb-3">
                <label className="form-label required-field">Category</label>
                <select
                  className="form-select"
                  required
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Screenshot</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <button 
                type="submit" 
                className="btn bg-solo-purple text-white w-100"
                disabled={submitFeedback.isPending}
              >
                {submitFeedback.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card bg-dark">
          <div className="card-header">
            <h4 className="card-title mb-0">Community Feedback</h4>
          </div>
          <div className="card-body">
            <div className="btn-group mb-3 w-100">
              <button
                className={`btn btn-outline-secondary ${sort === 'new' ? 'active' : ''}`}
                onClick={() => setSort('new')}
              >
                Latest
              </button>
              <button
                className={`btn btn-outline-secondary ${sort === 'top' ? 'active' : ''}`}
                onClick={() => setSort('top')}
              >
                Top
              </button>
            </div>

            {feedbackItems?.map(item => (
              <div key={item.id} className="feedback-item mb-3">
                <h6>{item.title}</h6>
                <p className="mb-1">{item.description}</p>
                <small className="text-muted">
                  By @{item.user.username} on {new Date(item.created_at).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
