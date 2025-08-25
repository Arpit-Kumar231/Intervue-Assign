'use client'

import { useState, useEffect } from 'react'
import { usePolling } from '@/context/PollingContext'

interface StudentFlowProps {
  onBack: () => void
}

type StudentScreen = 'name-entry' | 'waiting' | 'question' | 'results'

export default function StudentFlow({ onBack }: StudentFlowProps) {
  const {
    currentPoll,
    studentName,
    hasAnswered,
    timeRemaining,
    isConnected,
    joinAsStudent,
    submitAnswer
  } = usePolling()

  const [screen, setScreen] = useState<StudentScreen>('name-entry')
  const [name, setName] = useState('')
  const [selectedOption, setSelectedOption] = useState('')

  useEffect(() => {
    if (studentName) {
      setScreen('waiting')
    }
  }, [studentName])

  useEffect(() => {
    if (currentPoll && !hasAnswered) {
      setScreen('question')
    } else if (currentPoll && hasAnswered) {
      setScreen('results')
    } else if (!currentPoll && studentName) {
      setScreen('waiting')
    }
  }, [currentPoll, hasAnswered, studentName])

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      joinAsStudent(name.trim())
    }
  }

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedOption && currentPoll) {
      submitAnswer(currentPoll.id, selectedOption)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
        </div>

        {screen === 'name-entry' && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Enter your name</h2>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Enter
              </button>
            </form>
          </div>
        )}

        {screen === 'waiting' && (
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Waiting for Teacher</h2>
            <p className="text-gray-600">Waiting for teacher to ask question...</p>
          </div>
        )}

        {screen === 'question' && currentPoll && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Select correct option and submit</h2>
              <div className="text-sm text-gray-500">
                Time remaining: {formatTime(timeRemaining)}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Q. {currentPoll.question}</h3>
            </div>

            <form onSubmit={handleAnswerSubmit} className="space-y-3">
              {currentPoll.options.map((option) => (
                <label key={option.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="option"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option.text}</span>
                </label>
              ))}
              
              <button
                type="submit"
                disabled={!selectedOption}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mt-4"
              >
                Submit
              </button>
            </form>
          </div>
        )}

        {screen === 'results' && currentPoll && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Polling results</h2>
            
            <div className="space-y-3 mb-6">
              {currentPoll.options.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{option.text}</span>
                  <span className="font-semibold text-blue-600">
                    {option.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">Total votes: {currentPoll.totalVotes}</p>
              <button
                disabled
                className="bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
              >
                Waiting for new question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

