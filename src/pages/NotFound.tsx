import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-4">
          <h1 className="text-6xl font-bold text-purple-600 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Off Route!</h2>
          <p className="text-gray-600 mb-8">
            Looks like you've climbed off-route! The beta you're looking for isn't here. 
            Need a spot back to safety?
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors mr-4"
          >
            Down Climb
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Base
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
