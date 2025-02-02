import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Error from '../components/Error';
import { feedbackService, type FeedbackSubmission } from '../services/feedbackService';

const categories = [
  'Bug Report',
  'Feature Request',
  'User Experience',
  'Performance Issue',
  'Other'
];

const Feedback: React.FC = () => {
  const [sort, setSort] = useState<'new' | 'top'>('new');
  const [form, setForm] = useState<FeedbackSubmission>({
    title: '',
    description: '',
    category: '',
  });

  const { data: items = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['feedback', sort],
    queryFn: () => feedbackService.getFeedback(sort)
  });

  const submitFeedback = useMutation({
    mutationFn: (formData: FeedbackSubmission) => feedbackService.submitFeedback(formData),
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
    submitFeedback.mutate(form);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, screenshot: file }));
    }
  };

  if (isLoading) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  if (isError) {
    return (
      <Error 
        message={error?.message || "An unexpected error occurred"}
        type="page"
        retry={() => refetch()}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form section */}
        <div className="space-y-4">
          <div className="bg-bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Submit Feedback</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 rounded-md"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 rounded-md"
                  rows={4}
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 bg-gray-700 rounded-md"
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Screenshot (optional)</label>
                <input
                  type="file"
                  className="w-full px-3 py-2 bg-gray-700 rounded-md"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-solo-purple hover:bg-solo-purple-light text-white font-bold py-2 px-4 rounded transition-colors"
                disabled={submitFeedback.isPending}
              >
                {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>

        {/* Feedback list section */}
        <div className="space-y-4">
          <div className="bg-bg-card rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Community Feedback</h2>
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded transition-colors ${sort === 'new' ? 'bg-solo-purple' : 'bg-gray-700'}`}
                  onClick={() => setSort('new')}
                >
                  Latest
                </button>
                <button
                  className={`px-4 py-2 rounded transition-colors ${sort === 'top' ? 'bg-solo-purple' : 'bg-gray-700'}`}
                  onClick={() => setSort('top')}
                >
                  Top
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {items.length > 0 ? (
                items.map(item => (
                  <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-gray-300 mt-2">{item.description}</p>
                    <div className="mt-2 text-sm text-gray-400">
                      <span>By @{item.user.username}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">No feedback items yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;