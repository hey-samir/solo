import React from 'react'

const About: React.FC = () => {
  console.log('About component rendering...'); // Debug log

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-solo-purple mb-4">Quantify your Ascent</h1>
        <p className="text-xl text-text-primary max-w-3xl mx-auto">
          Solo is the first and only beautifully functional app dedicated to solo indoor climbing. 
          Track your progress, analyze your performance, and join a community of passionate climbers.
        </p>
      </section>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <FeatureCard
          icon="trending_up"
          title="Track Your Progress"
          description="Log your climbs, track your sends, and watch your improvement over time."
        />
        <FeatureCard
          icon="analytics"
          title="Detailed Analytics"
          description="Get insights into your climbing patterns, strengths, and areas for improvement."
        />
        <FeatureCard
          icon="group"
          title="Join the Community"
          description="Connect with other climbers, share beta, and celebrate achievements together."
        />
        <FeatureCard
          icon="emoji_events"
          title="Compete & Compare"
          description="See how you stack up against other climbers in your gym and worldwide."
        />
      </div>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-solo-purple mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StepCard
            number="1"
            title="Log Your Climbs"
            description="Record your attempts and sends as you climb, including grade, style, and attempts."
          />
          <StepCard
            number="2"
            title="Track Progress"
            description="View your statistics, analyze your performance, and identify trends."
          />
          <StepCard
            number="3"
            title="Improve & Share"
            description="Set goals, celebrate achievements, and connect with the climbing community."
          />
        </div>
      </section>
    </div>
  )
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-bg-card rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center mb-4">
      <i className="material-icons text-3xl text-solo-purple mr-3">{icon}</i>
      <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
    </div>
    <p className="text-text-muted">{description}</p>
  </div>
)

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => (
  <div className="text-center p-6">
    <div className="w-12 h-12 bg-solo-purple rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-white font-bold text-xl">{number}</span>
    </div>
    <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
    <p className="text-text-muted">{description}</p>
  </div>
)

export default About