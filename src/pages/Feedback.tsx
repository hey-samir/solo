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

interface AccordionItemProps {
  question: string;
  answer: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-bg-card rounded-lg overflow-hidden mb-2">
      <button
        className={`w-full px-6 py-4 text-left focus:outline-none flex justify-between items-center transition-colors duration-200 ${
          isOpen ? 'bg-solo-purple' : 'hover:bg-bg-kpi-card'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-text-primary">{question}</span>
        <i className={`material-icons transform transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}>
          expand_more
        </i>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-6 bg-bg-kpi-card">
          <p className="text-text-muted whitespace-pre-line">{answer}</p>
        </div>
      </div>
    </div>
  );
};

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
      toast.success('Feedback submitted successfully');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback.mutate(form);
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form and FAQ */}
        <div className="space-y-8">
          {/* Feedback Form */}
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
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 rounded-md"
                  rows={4}
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  required
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

          {/* FAQ Section */}
          <div className="bg-bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              <AccordionItem
                question="How do I log a climb?"
                answer="To log a route, tap the '+' button in the navigation bar. Fill in the details about your route including the color, grade, and whether it was a Send or a Try. Routes are tracked as either Sends (successful completions) or Tries (unsuccessful attempts)."
              />
              <AccordionItem
                question="What's the difference between a Send and a Try?"
                answer="A 'Send' means you successfully completed the route from start to finish without falling. A 'Try' is when you attempted the route but didn't complete it. Both are valuable to track as they show your progress over time."
              />
              <AccordionItem
                question="How are points calculated?"
                answer="Points are calculated based on the difficulty of the route and whether you sent it or not. A Send earns you 10 points multiplied by your star rating, while Tries earn 5 points multiplied by your star rating. This system rewards both successful completions and the effort put into attempting challenging routes."
              />
              <AccordionItem
                question="What do the stats metrics mean?"
                answer={`Your statistics show various aspects of your climbing progress:
• Send Rate: The percentage of successful sends out of total routes attempted
• Average Grade: The typical difficulty level you climb
• Points: Your overall achievement score based on your routes
• Sessions: Groups of routes climbed within the same timeframe
• Star Rating: Your performance rating based on successful sends`}
              />
              <AccordionItem
                question="What are the dimensions of a Send?"
                answer={`When logging a Send, you'll record:
• Grade: The difficulty rating of the route
• Color: The hold color used for the route
• Type: Whether it's a Send (success) or Try (attempt)
• Stars: Your rating of the route quality
• Date: When you climbed the route
• Session: Which climbing session it belongs to`}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Community Feedback */}
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