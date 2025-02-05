import React from 'react'

const FAQ: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <div className="space-y-6">
        <div className="bg-bg-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">What is Solo?</h2>
          <p className="text-text-secondary">
            Solo is a mobile-first climbing performance tracking application designed to help climbers monitor and improve their skills through an intuitive, performance-focused platform.
          </p>
        </div>

        <div className="bg-bg-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">How do I track my climbs?</h2>
          <p className="text-text-secondary">
            Use the "Sends" tab in the bottom navigation to log your climbs. You can record details like grade, attempts, and notes for each climb.
          </p>
        </div>

        <div className="bg-bg-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">What are Squads?</h2>
          <p className="text-text-secondary">
            Squads are groups of climbers who train together. Join a squad to track group progress, compete in friendly competitions, and motivate each other.
          </p>
        </div>

        <div className="bg-bg-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">How do I view my progress?</h2>
          <p className="text-text-secondary">
            Check the "Stats" tab to view detailed analytics of your climbing progression, including grade distribution, session frequency, and performance trends.
          </p>
        </div>

        <div className="bg-bg-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">What's included in Solo PRO?</h2>
          <p className="text-text-secondary">
            Solo PRO includes advanced analytics, custom training plans, unlimited climb logging, and exclusive squad features. Visit our Pricing page for more details.
          </p>
        </div>
      </div>
    </div>
  )
}

export default FAQ
