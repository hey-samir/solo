import React, { useEffect } from 'react'
import { Collapse } from 'bootstrap'

const About: React.FC = () => {
  // Initialize Bootstrap components
  useEffect(() => {
    // Initialize all accordions
    const accordionItems = document.querySelectorAll('.accordion-collapse')
    accordionItems.forEach(item => {
      new Collapse(item, {
        toggle: false
      })
    })
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 font-lexend">
      {/* App Description */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold text-solo-purple mb-4">Quantify your Ascent</h2>
        <p className="text-xl text-text-primary">
          Solo is the first and only beautifully functional app dedicated to solo indoor climbing. 
          Log your sends to rack up points, track your progress with detailed metrics, and climb 
          your way to the top of global leaderboards. Solo is designed to help climbers like you 
          scale new heights—one ascent at a time.
        </p>
      </section>

      {/* Key Features */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </section>

      {/* FAQ Section */}
      <section className="mb-8">
        <h3 className="text-2xl font-bold text-solo-purple mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-bg-card rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-4 bg-bg-kpi-card hover:bg-opacity-90 transition-colors duration-200"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#faq${index + 1}`}
                aria-expanded="false"
              >
                <h4 className="text-lg font-semibold text-text-primary flex items-center justify-between">
                  {faq.question}
                  <i className="material-icons transition-transform duration-200">expand_more</i>
                </h4>
              </button>
              <div id={`faq${index + 1}`} className="collapse">
                <div className="p-4 bg-bg-card text-text-primary">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
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
  <div className="bg-bg-card rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-200">
    <i className="material-icons text-solo-purple text-4xl mb-4">{icon}</i>
    <h5 className="text-xl font-semibold text-text-primary mb-2">{title}</h5>
    <p className="text-text-muted">{description}</p>
  </div>
)

const faqs = [
  {
    question: 'How do I log a climb?',
    answer: 'To log a route, tap the \'+\' button in the navigation bar. Fill in the details about your route including the color, grade, and whether it was a Send or a Try. Routes are tracked as either Sends (successful completions) or Tries (unsuccessful attempts).'
  },
  {
    question: 'What\'s the difference between a Send and a Try?',
    answer: 'A \'Send\' means you successfully completed the route from start to finish without falling. A \'Try\' is when you attempted the route but didn\'t complete it. Both are valuable to track as they show your progress over time. The total number of your Sends and Tries together represents all your Routes.'
  },
  {
    question: 'How are points calculated?',
    answer: 'Points are calculated based on the difficulty of the route and whether you sent it or not. A Send earns you 10 points multiplied by your star rating, while Tries earn 5 points multiplied by your star rating. This system rewards both successful completions and the effort put into attempting challenging routes.'
  },
  {
    question: 'What do the stats metrics mean?',
    answer: `Your statistics show various aspects of your climbing progress:
    • Send Rate: The percentage of successful sends out of total routes attempted
    • Average Grade: The typical difficulty level you climb
    • Points: Your overall achievement score based on your routes
    • Sessions: Groups of routes climbed within the same timeframe
    • Star Rating: Your performance rating based on successful sends`
  },
  {
    question: 'What are the dimensions of a Send?',
    answer: `When logging a Send, you'll record:
    • Grade: The difficulty rating of the route
    • Color: The hold color used for the route
    • Type: Whether it's a Send (success) or Try (attempt)
    • Stars: Your rating of the route quality
    • Date: When you climbed the route
    • Session: Which climbing session it belongs to`
  }
]

export default About