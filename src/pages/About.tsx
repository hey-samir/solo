import React from 'react'

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

      {/* FAQ Section with Bootstrap Accordion */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-solo-purple mb-6 text-center">FAQ</h2>
        <div className="accordion" id="faqAccordion">
          <FaqAccordionItem
            id="faq1"
            question="How do I log a climb?"
            answer="To log a route, tap the '+' button in the navigation bar. Fill in the details about your route including the color, grade, and whether it was a Send or a Try. Routes are tracked as either Sends (successful completions) or Tries (unsuccessful attempts)."
          />
          <FaqAccordionItem
            id="faq2"
            question="What's the difference between a Send and a Try?"
            answer="A 'Send' means you successfully completed the route from start to finish without falling. A 'Try' is when you attempted the route but didn't complete it. Both are valuable to track as they show your progress over time."
          />
          <FaqAccordionItem
            id="faq3"
            question="How are points calculated?"
            answer="Points are calculated based on the difficulty of the route and whether you sent it or not. A Send earns you 10 points multiplied by your star rating, while Tries earn 5 points multiplied by your star rating. This system rewards both successful completions and the effort put into attempting challenging routes."
          />
          <FaqAccordionItem
            id="faq4"
            question="What do the stats metrics mean?"
            answer={`Your statistics show various aspects of your climbing progress:
              • Send Rate: The percentage of successful sends out of total routes attempted
              • Average Grade: The typical difficulty level you climb
              • Points: Your overall achievement score based on your routes
              • Sessions: Groups of routes climbed within the same timeframe
              • Star Rating: Your performance rating based on successful sends`}
          />
          <FaqAccordionItem
            id="faq5"
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
  <div className="bg-bg-card rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center mb-4">
      <i className="material-icons text-3xl text-solo-purple mr-3">{icon}</i>
      <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
    </div>
    <p className="text-text-muted">{description}</p>
  </div>
)

interface FaqAccordionItemProps {
  id: string;
  question: string;
  answer: string;
}

const FaqAccordionItem: React.FC<FaqAccordionItemProps> = ({ id, question, answer }) => (
  <div className="accordion-item bg-dark border-0 mb-4">
    <h2 className="accordion-header">
      <button 
        className="accordion-button collapsed bg-solo-purple text-white border-0 rounded-lg"
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target={`#${id}`}
      >
        {question}
      </button>
    </h2>
    <div 
      id={id} 
      className="accordion-collapse collapse"
      data-bs-parent="#faqAccordion"
    >
      <div className="accordion-body text-text-primary bg-bg-card rounded-b-lg">
        <p className="whitespace-pre-line">{answer}</p>
      </div>
    </div>
  </div>
)

export default About