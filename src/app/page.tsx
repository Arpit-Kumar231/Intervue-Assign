'use client'

import { useState } from 'react'
import { PollingProvider } from '@/context/PollingContext'
import UserRoleSelection from '@/components/UserRoleSelection'
import StudentFlow from '@/components/StudentFlow'
import TeacherFlow from '@/components/TeacherFlow'

type UserRole = 'student' | 'teacher' | null

function HomeContent() {
  const [userRole, setUserRole] = useState<UserRole>(null)

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role)
  }

  const handleBackToSelection = () => {
    setUserRole(null)
  }

  if (!userRole) {
    return (
      <div>
        <UserRoleSelection onRoleSelect={handleRoleSelect} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {userRole === 'student' ? (
        <StudentFlow onBack={handleBackToSelection} />
      ) : (
        <TeacherFlow onBack={handleBackToSelection} />
      )}
    </div>
  )
}

export default function Home() {
  return (
    <PollingProvider>
      <HomeContent />
    </PollingProvider>
  )
}
