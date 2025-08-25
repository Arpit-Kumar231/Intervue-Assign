'use client'

import { useState, useEffect } from 'react'
import { usePolling } from '@/context/PollingContext'

interface TeacherFlowProps {
  onBack: () => void
}

type TeacherScreen = 'create-poll' | 'results'

export default function TeacherFlow({ onBack }: TeacherFlowProps) {
  const {
    currentPoll,
    students,
    timeRemaining,
    isConnected,
    createPoll
  } = usePolling()

  const [screen, setScreen] = useState<TeacherScreen>('create-poll')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [timeLimit, setTimeLimit] = useState(60)

  useEffect(() => {
    if (currentPoll) {
      setScreen('results')
    } else {
      setScreen('create-poll')
    }
  }, [currentPoll])

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault()
    const validOptions = options.filter(opt => opt.trim() !== '')
    if (question.trim() && validOptions.length >= 2) {
      createPoll(question.trim(), validOptions, timeLimit)
      setQuestion('')
      setOptions(['', '', '', ''])
      setTimeLimit(60)
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
        </div>

        {screen === 'create-poll' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Enter question and options</h2>
            
            <form onSubmit={handleCreatePoll} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required={index < 2}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    + Add other option
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (seconds)
                </label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  min="10"
                  max="300"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Ask question
              </button>
            </form>
          </div>
        )}

        {screen === 'results' && currentPoll && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Polling results</h2>
              {timeRemaining > 0 && (
                <div className="text-sm text-gray-500">
                  Time remaining: {formatTime(timeRemaining)}
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Q. {currentPoll.question}</h3>
            </div>

            <div className="space-y-3 mb-6">
              {currentPoll.options.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{option.text}</span>
                  <span className="font-semibold text-green-600">
                    {option.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Student Status</h4>
                <p className="text-blue-600">
                  Total Students: {students.length}
                </p>
                <p className="text-blue-600">
                  Answered: {students.filter(s => s.hasAnswered).length}
                </p>
                <p className="text-blue-600">
                  Pending: {students.filter(s => !s.hasAnswered).length}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Poll Statistics</h4>
                <p className="text-green-600">
                  Total Votes: {currentPoll.totalVotes}
                </p>
                <p className="text-green-600">
                  Time Limit: {currentPoll.timeLimit}s
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                disabled={timeRemaining > 0}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Ask new question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

