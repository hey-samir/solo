import React, { useState } from 'react'

const About: React.FC = () => {
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

      {/* FAQ Section with Tailwind Accordion */}
      <section className="mb-12 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-solo-purple mb-6 text-center">FAQ</h2>
        <div className="space-y-4">
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
  <div className="bg-bg-card rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow duration-200">
    <div className="flex flex-col md:flex-row items-center md:items-start mb-3 md:mb-4">
      <i className="material-icons text-2xl md:text-3xl text-solo-purple mb-2 md:mb-0 md:mr-3">{icon}</i>
      <h3 className="text-lg md:text-xl font-semibold text-text-primary text-center md:text-left">{title}</h3>
    </div>
    <p className="text-text-muted text-sm md:text-base text-center md:text-left">{description}</p>
  </div>
)

interface AccordionItemProps {
  question: string;
  answer: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-bg-card rounded-lg overflow-hidden">
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
  )
}

export default About