import React from 'react'

const About: React.FC = () => {
  return (
    <div className="container mt-3">
      {/* App Description */}
      <section className="mb-4">
        <h2 className="text-solo-purple mb-3">Quantify your Ascent</h2>
        <p className="lead">
          Solo is the first and only beautifully functional app dedicated to solo indoor climbing. Log your sends to rack up points, track your progress with detailed metrics, and climb your way to the top of global leaderboards. Solo is designed to help climbers like you scale new heights—one ascent at a time.
        </p>
      </section>

      {/* Key Features */}
      <section className="mb-5">
        <div className="row g-3">
          <div className="col-6">
            <div className="card feature-card kpi-card h-100">
              <div className="card-body text-center d-flex flex-column justify-content-center">
                <i className="material-icons text-solo-purple mb-2" style={{ fontSize: '2.25rem' }}>arrow_upward</i>
                <h5 className="card-title mb-2">Log Sends Instantly</h5>
                <p className="card-text small mb-0">Track all metrics for routes</p>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card feature-card kpi-card h-100">
              <div className="card-body text-center d-flex flex-column justify-content-center">
                <i className="material-icons text-solo-purple mb-2" style={{ fontSize: '2.25rem' }}>emoji_events</i>
                <h5 className="card-title mb-2">Compete Globally</h5>
                <p className="card-text small mb-0">See how you rank worldwide</p>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card feature-card kpi-card h-100">
              <div className="card-body text-center d-flex flex-column justify-content-center">
                <i className="material-icons text-solo-purple mb-2" style={{ fontSize: '2.25rem' }}>calendar_today</i>
                <h5 className="card-title mb-2">View Sessions</h5>
                <p className="card-text small mb-0">Track your sessions</p>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card feature-card kpi-card h-100">
              <div className="card-body text-center d-flex flex-column justify-content-center">
                <i className="material-icons text-solo-purple mb-2" style={{ fontSize: '2.25rem' }}>bar_chart</i>
                <h5 className="card-title mb-2">Track Progress</h5>
                <p className="card-text small mb-0">Analyze your climbing stats</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-5">
        <h3 className="text-solo-purple mb-3">Frequently Asked Questions</h3>
        <div className="accordion" id="faqAccordion">
          {/* FAQ items */}
          {faqs.map((faq, index) => (
            <div key={index} className="accordion-item bg-dark border-0">
              <h2 className="accordion-header">
                <button 
                  className="accordion-button bg-solo-purple text-white border-0" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target={`#faq${index + 1}`}
                >
                  {faq.question}
                </button>
              </h2>
              <div id={`faq${index + 1}`} className="accordion-collapse collapse">
                <div className="accordion-body text-white">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>
        {`
        .accordion-button::after {
          filter: brightness(0) invert(1);
        }
        `}
      </style>
    </div>
  )
}

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
