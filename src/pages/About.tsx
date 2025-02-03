import React from 'react'

const About: React.FC = () => {
  console.log('About component rendering...'); // Debug log

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-solo-purple">About Solo</h1>
      <p className="mt-4 text-lg">
        Solo is your climbing companion.
      </p>
    </div>
  )
}

export default About