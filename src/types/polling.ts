export interface Poll {
  id: string
  question: string
  options: PollOption[]
  timeLimit: number
  createdAt: Date
  isActive: boolean
  totalVotes: number
}

export interface PollOption {
  id: string
  text: string
  votes: number
  percentage: number
}

export interface Student {
  id: string
  name: string
  hasAnswered: boolean
  answer?: string
  joinedAt: Date
}

export interface PollResult {
  pollId: string
  question: string
  options: PollOption[]
  totalVotes: number
  timeLimit: number
  createdAt: Date
}

export type UserRole = 'student' | 'teacher'

export interface SocketEvents {
  'student:join': (data: { name: string }) => void
  'teacher:create-poll': (data: { question: string; options: string[]; timeLimit: number }) => void
  'student:submit-answer': (data: { pollId: string; optionId: string }) => void
  'poll:update': (data: Poll) => void
  'poll:end': (data: PollResult) => void
  'student:list': (data: Student[]) => void
  'error': (data: { message: string }) => void
}

