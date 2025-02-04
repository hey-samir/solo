"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_query_1 = require("@tanstack/react-query");
const Error_1 = __importDefault(require("../components/Error"));
const feedbackService_1 = require("../services/feedbackService");
const categories = [
    'Bug Report',
    'Feature Request',
    'User Experience',
    'Performance Issue',
    'Other'
];
const Feedback = () => {
    const [sort, setSort] = (0, react_1.useState)('new');
    const [form, setForm] = (0, react_1.useState)({
        title: '',
        description: '',
        category: '',
    });
    const { data: items = [], isLoading, isError, error, refetch } = (0, react_query_1.useQuery)({
        queryKey: ['feedback', sort],
        queryFn: () => feedbackService_1.feedbackService.getFeedback(sort)
    });
    const submitFeedback = (0, react_query_1.useMutation)({
        mutationFn: (formData) => feedbackService_1.feedbackService.submitFeedback(formData),
        onSuccess: () => {
            setForm({
                title: '',
                description: '',
                category: '',
            });
            refetch();
        }
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        submitFeedback.mutate(form);
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm(prev => ({ ...prev, screenshot: file }));
        }
    };
    if (isLoading) {
        return <div className="text-center mt-4">Loading...</div>;
    }
    if (isError) {
        return (<Error_1.default message={error?.message || "An unexpected error occurred"} type="page" retry={() => refetch()}/>);
    }
    return (<div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form section */}
        <div className="space-y-4">
          <div className="bg-bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Submit Feedback</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" className="w-full px-3 py-2 bg-gray-700 rounded-md" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} required/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full px-3 py-2 bg-gray-700 rounded-md" rows={4} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} required/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full px-3 py-2 bg-gray-700 rounded-md" value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} required>
                  <option value="">Select a category</option>
                  {categories.map(category => (<option key={category} value={category}>
                      {category}
                    </option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Screenshot (optional)</label>
                <input type="file" className="w-full px-3 py-2 bg-gray-700 rounded-md" accept="image/*" onChange={handleFileChange}/>
              </div>
              <button type="submit" className="w-full bg-solo-purple hover:bg-solo-purple-light text-white font-bold py-2 px-4 rounded transition-colors" disabled={submitFeedback.isPending}>
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
                <button className={`px-4 py-2 rounded transition-colors ${sort === 'new' ? 'bg-solo-purple' : 'bg-gray-700'}`} onClick={() => setSort('new')}>
                  Latest
                </button>
                <button className={`px-4 py-2 rounded transition-colors ${sort === 'top' ? 'bg-solo-purple' : 'bg-gray-700'}`} onClick={() => setSort('top')}>
                  Top
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {items.length > 0 ? (items.map(item => (<div key={item.id} className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-gray-300 mt-2">{item.description}</p>
                    <div className="mt-2 text-sm text-gray-400">
                      <span>By @{item.user.username}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>))) : (<p className="text-center text-gray-400">No feedback items yet</p>)}
            </div>
          </div>
        </div>
      </div>
    </div>);
};
exports.default = Feedback;
