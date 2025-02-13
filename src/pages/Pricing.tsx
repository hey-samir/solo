import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Pricing: FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="container px-6 py-8 font-lexend">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Solo Pro</h1>

      <div className="bg-bg-card rounded-lg shadow-lg overflow-hidden">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-border-default">
              <th className="py-3 px-4 text-left" style={{ width: '50%' }}>Features</th>
              <th className="py-3 px-4 text-center" style={{ width: '25%' }}>
                <h3 className="text-base font-semibold">Base</h3>
              </th>
              <th className="py-3 px-4 text-center" style={{ width: '25%' }}>
                <h3 className="text-base font-semibold">
                  <span className="bg-solo-purple text-white px-2 py-0.5 rounded text-sm">PRO</span>
                </h3>
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-border-default">
              <td className="py-3 px-4">Send Logging</td>
              <td className="text-center py-3 px-4">
                <i className="material-icons text-white text-base">circle</i>
              </td>
              <td className="text-center py-3 px-4">
                <i className="material-icons text-white text-base">circle</i>
              </td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-3 px-4">Global Leaderboard</td>
              <td className="text-center py-3 px-4">
                <i className="material-icons text-white text-base">circle</i>
              </td>
              <td className="text-center py-3 px-4">
                <i className="material-icons text-white text-base">circle</i>
              </td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-3 px-4">Session View</td>
              <td className="text-center py-3 px-4">
                <i className="material-icons text-white text-base">circle</i>
              </td>
              <td className="text-center py-3 px-4">
                <i className="material-icons text-white text-base">circle</i>
              </td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-3 px-4">Stats Tracking</td>
              <td className="text-center py-3 px-4">
                <i className="material-icons text-white text-base">circle</i>
              </td>
              <td className="text-center py-3 px-4">
                <i className="material-icons text-white text-base">circle</i>
              </td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-3 px-4">Ad-free Experience</td>
              <td className="text-center py-3 px-4"></td>
              <td className="text-center py-3 px-4">
                <i className="material-icons text-white text-base">circle</i>
              </td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-3 px-4">Custom Avatars</td>
              <td className="text-center py-3 px-4"></td>
              <td className="text-center py-3 px-4">
                <i className="material-icons text-white text-base">circle</i>
              </td>
            </tr>
            <tr className="border-b border-border-default">
              <td className="py-3 px-4">Solo AI</td>
              <td className="text-center py-3 px-4"></td>
              <td className="text-center py-3 px-4">
                <i className="material-icons text-white text-base">circle</i>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Pricing