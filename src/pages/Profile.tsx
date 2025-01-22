import React, { FC } from 'react'
import { useParams } from 'react-router-dom'

const Profile: FC = () => {
  const { username } = useParams()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      {username ? (
        <p className="mt-4 text-gray-600">Viewing profile for {username}</p>
      ) : (
        <p className="mt-4 text-gray-600">Your profile</p>
      )}
    </div>
  )
}

export default Profile