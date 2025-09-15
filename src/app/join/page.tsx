'use client'

import { useState } from 'react'

export default function JoinACC() {
  const [isFormOpen, setIsFormOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Form Container */}
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 relative">
        {/* Close Button */}
        <button 
          onClick={() => window.history.back()}
          className="absolute top-4 right-4 text-2xl font-bold text-gray-600 hover:text-gray-800"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NEW PLAYER SIGN UP</h1>
          <p className="text-lg text-gray-600">JOIN ARIZONA CRICKET CLUB TODAY!</p>
        </div>

        {/* Form */}
        <form className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <input
              type="tel"
              placeholder="Phone"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Student Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Are you a student? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="student" value="yes" className="mr-3" required />
                <span>Yes</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="student" value="no" className="mr-3" required />
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Player Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am... <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="role" value="batsman" className="mr-3" required />
                <span>Batsman</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="role" value="bowler" className="mr-3" required />
                <span>Bowler</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="role" value="keeper" className="mr-3" required />
                <span>Keeper</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="role" value="working" className="mr-3" required />
                <span>Still working on my flare</span>
              </label>
            </div>
          </div>

          {/* Side Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Side preference <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="side" value="right-batsman" className="mr-3" required />
                <span>Right handed batsman</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="side" value="left-batsman" className="mr-3" required />
                <span>Left handed batsman</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="side" value="right-bowler" className="mr-3" required />
                <span>Right handed bowler</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="side" value="left-bowler" className="mr-3" required />
                <span>Left handed bowler</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="side" value="other" className="mr-3" required />
                <span>Other</span>
              </label>
            </div>
          </div>

          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What city do you currently reside in? <span className="text-red-500">*</span>
            </label>
            <select 
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose an option</option>
              <option value="phoenix">Phoenix</option>
              <option value="gilbert">Gilbert</option>
              <option value="mesa">Mesa</option>
              <option value="tempe">Tempe</option>
              <option value="chandler">Chandler</option>
              <option value="scottsdale">Scottsdale</option>
              <option value="glendale">Glendale</option>
              <option value="peoria">Peoria</option>
              <option value="surprise">Surprise</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Any additional information we need to know about you?
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell us about your cricket experience, availability, or any other relevant information..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-black text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-gray-800 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}