'use client'

interface UserRoleSelectionProps {
  onRoleSelect: (role: 'student' | 'teacher') => void
}

export default function UserRoleSelection({ onRoleSelect }: UserRoleSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Live Polling System</h1>
          <p className="text-gray-600">Select what type of user you are?</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => onRoleSelect('student')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>I am Student</span>
          </button>
          
          <button
            onClick={() => onRoleSelect('teacher')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>I am Teacher</span>
          </button>
        </div>
      </div>
    </div>
  )
}

