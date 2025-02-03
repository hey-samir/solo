import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-bg-kpi-card rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-solo-purple mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-text-primary mb-4">Off Route!</h2>
          <p className="text-text-secondary mb-8">
            Looks like you've climbed off-route! The beta you're looking for isn't here. 
            Time for a controlled descent or take the express line back to the start.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-solo-purple text-text-primary px-6 py-2 rounded-md hover:bg-solo-purple-light transition-colors mr-4 shadow-md hover:shadow-lg"
          >
            Down Climb
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-bg-card text-text-primary px-6 py-2 rounded-md hover:bg-opacity-80 transition-colors shadow-md hover:shadow-lg"
          >
            Take the Bail Anchor
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;