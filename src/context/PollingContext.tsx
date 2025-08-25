'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { Poll, Student, PollResult, UserRole } from '@/types/polling'

interface PollingContextType {
  socket: Socket | null
  currentPoll: Poll | null
  students: Student[]
  pollResults: PollResult[]
  userRole: UserRole | null
  studentName: string
  hasAnswered: boolean
  timeRemaining: number
  isConnected: boolean
  setUserRole: (role: UserRole) => void
  setStudentName: (name: string) => void
  joinAsStudent: (name: string) => void
  createPoll: (question: string, options: string[], timeLimit: number) => void
  submitAnswer: (pollId: string, optionId: string) => void
  disconnect: () => void
}

const PollingContext = createContext<PollingContextType | undefined>(undefined)

export function PollingProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [pollResults, setPollResults] = useState<PollResult[]>([])
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [studentName, setStudentName] = useState('')
  const [hasAnswered, setHasAnswered] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const newSocket = io('http://localhost:3001')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    })

    newSocket.on('poll:update', (poll: Poll) => {
      setCurrentPoll(poll)
      setHasAnswered(false)
    })

    newSocket.on('poll:end', (result: PollResult) => {
      setPollResults(prev => [...prev, result])
      setCurrentPoll(null)
    })

    newSocket.on('student:list', (studentList: Student[]) => {
      setStudents(studentList)
    })

    newSocket.on('error', (data: { message: string }) => {
      console.error('Server error:', data.message)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentPoll && currentPoll.isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentPoll, timeRemaining])

  const joinAsStudent = (name: string) => {
    if (socket) {
      socket.emit('student:join', { name })
      setStudentName(name)
      setUserRole('student')
    }
  }

  const createPoll = (question: string, options: string[], timeLimit: number) => {
    if (socket) {
      socket.emit('teacher:create-poll', { question, options, timeLimit })
      setTimeRemaining(timeLimit)
    }
  }

  const submitAnswer = (pollId: string, optionId: string) => {
    if (socket) {
      socket.emit('student:submit-answer', { pollId, optionId })
      setHasAnswered(true)
    }
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
    }
    setCurrentPoll(null)
    setStudents([])
    setPollResults([])
    setUserRole(null)
    setStudentName('')
    setHasAnswered(false)
    setTimeRemaining(0)
    setIsConnected(false)
  }

  const value: PollingContextType = {
    socket,
    currentPoll,
    students,
    pollResults,
    userRole,
    studentName,
    hasAnswered,
    timeRemaining,
    isConnected,
    setUserRole,
    setStudentName,
    joinAsStudent,
    createPoll,
    submitAnswer,
    disconnect
  }

  return (
    <PollingContext.Provider value={value}>
      {children}
    </PollingContext.Provider>
  )
}

export function usePolling() {
  const context = useContext(PollingContext)
  if (context === undefined) {
    throw new Error('usePolling must be used within a PollingProvider')
  }
  return context
}

