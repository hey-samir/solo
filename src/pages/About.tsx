import React from 'react'
import { useFeatureFlags } from '../contexts/FeatureFlagsContext'

const About: React.FC = () => {
  const { flags } = useFeatureFlags()

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

      {/* Features Grid - 2x2 layout with improved spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto mb-12">
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
      <i className="material-icons text-3xl text-solo-purple mr-4">{icon}</i>
      <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
    </div>
    <p className="text-text-muted text-base">{description}</p>
  </div>
)

export default About