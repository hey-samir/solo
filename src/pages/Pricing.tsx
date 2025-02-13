import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Pricing: FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="container px-6 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Solo Pro</h1>

      <div className="bg-bg-card rounded-lg shadow-lg overflow-hidden">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-border-default">
              <th className="py-4 px-6 text-left" style={{ width: '50%' }}>Features</th>
              <th className="py-4 px-6 text-center" style={{ width: '25%' }}>
                <h3 className="text-lg font-semibold mb-2">Base</h3>
              </th>
              <th className="py-4 px-6 text-center" style={{ width: '25%' }}>
                <h3 className="text-lg font-semibold mb-2">
                  <span className="bg-solo-purple text-white px-2 py-1 rounded text-sm">PRO</span>
                </h3>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-default">
              <td className="py-4 px-6">Send Logging</td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle</i>
              </td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle</i>
              </td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-4 px-6">Global Leaderboard</td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle</i>
              </td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle</i>
              </td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-4 px-6">Session View</td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle</i>
              </td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle</i>
              </td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-4 px-6">Stats Tracking</td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle</i>
              </td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle</i>
              </td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-4 px-6">Ad-free Experience</td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle_outlined</i>
              </td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle</i>
              </td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-4 px-6">Custom Avatars</td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle_outlined</i>
              </td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle</i>
              </td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-4 px-6">Solo AI</td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle_outlined</i>
              </td>
              <td className="text-center py-4 px-6">
                <i className="material-icons text-white">circle</i>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Pricing