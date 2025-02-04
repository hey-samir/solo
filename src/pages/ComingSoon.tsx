import React from 'react'

const ComingSoon: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-solo-purple mb-4">Quantify your Ascent</h1>
        <p className="text-xl text-text-primary max-w-3xl mx-auto">
          Track your progress, analyze your performance, compete globally and join a community of passionate climbers.
        </p>
      </section>

      {/* Features Preview Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto mb-12 px-4">
        <FeatureCard
          icon="arrow_upward"
          title="Log Sends Instantly"
          description="Track all metrics for routes"
        />
        <FeatureCard
          icon="emoji_events"
          title="Compete Globally"
          description="See how you rank worldwide"
        />
        <FeatureCard
          icon="calendar_today"
          title="View Sessions"
          description="Track your sessions"
        />
        <FeatureCard
          icon="bar_chart"
          title="Track Progress"
          description="Analyze your climbing stats"
        />
      </div>

      {/* Newsletter Signup */}
      <section className="max-w-md mx-auto text-center mb-16">
        <h2 className="text-2xl font-bold text-solo-purple mb-4">Get Notified When We Launch</h2>
        <p className="text-text-muted mb-6">
          Be the first to know when Solo is ready for your climbing journey.
        </p>
        <form className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Enter your email"
            className="px-4 py-3 bg-bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-solo-purple"
          />
          <button 
            type="submit"
            className="bg-solo-purple hover:bg-solo-purple-light text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Notify Me
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="text-center text-text-muted text-sm">
        <p>
          Copyright{' '}
          <a 
            href="https://samir.xyz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-solo-purple hover:text-solo-purple-light"
          >
            Interspace Labs
          </a>
          {' '}2025. Built with{' '}
          <a 
            href="https://replit.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-solo-purple hover:text-solo-purple-light"
          >
            Replit
          </a>
          {' '}by coding at the speed of thought.
        </p>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-bg-card rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow duration-200">
    <div className="flex flex-col md:flex-row items-center md:items-start mb-3 md:mb-4">
      <i className="material-icons text-2xl md:text-3xl text-solo-purple mb-2 md:mb-0 md:mr-3">{icon}</i>
      <h3 className="text-lg md:text-xl font-semibold text-text-primary text-center md:text-left">{title}</h3>
    </div>
    <p className="text-text-muted text-sm md:text-base text-center md:text-left">{description}</p>
  </div>
)

export default ComingSoon