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

      {/* Features Grid - 2x2 layout */}
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

export default About