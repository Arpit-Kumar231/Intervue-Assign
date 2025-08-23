const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())

let currentPoll = null
let students = new Map()
let pollTimer = null

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function calculateResults(poll) {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0)
  
  poll.options.forEach(option => {
    option.percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
  })
  
  poll.totalVotes = totalVotes
  return poll
}

function endPoll() {
  if (currentPoll && pollTimer) {
    clearTimeout(pollTimer)
    currentPoll.isActive = false
    
    const results = {
      pollId: currentPoll.id,
      question: currentPoll.question,
      options: currentPoll.options,
      totalVotes: currentPoll.totalVotes,
      timeLimit: currentPoll.timeLimit,
      createdAt: currentPoll.createdAt
    }
    
    io.emit('poll:end', results)
    currentPoll = null
    pollTimer = null
    
    students.forEach(student => {
      student.hasAnswered = false
      student.answer = null
    })
    
    io.emit('student:list', Array.from(students.values()))
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  if (currentPoll) {
    socket.emit('poll:update', currentPoll)
  }
  socket.emit('student:list', Array.from(students.values()))
  
  socket.on('student:join', (data) => {
    const studentId = generateId()
    const student = {
      id: studentId,
      name: data.name,
      hasAnswered: false,
      joinedAt: new Date()
    }
    
    students.set(studentId, student)
    socket.studentId = studentId
    
    console.log(`Student joined: ${data.name}`)
    io.emit('student:list', Array.from(students.values()))
  })
  
  socket.on('teacher:create-poll', (data) => {
    if (pollTimer) {
      clearTimeout(pollTimer)
    }
    
    const pollId = generateId()
    const options = data.options.map((text, index) => ({
      id: generateId(),
      text: text,
      votes: 0,
      percentage: 0
    }))
    
    currentPoll = {
      id: pollId,
      question: data.question,
      options: options,
      timeLimit: data.timeLimit,
      createdAt: new Date(),
      isActive: true,
      totalVotes: 0
    }
    
    pollTimer = setTimeout(() => {
      endPoll()
    }, data.timeLimit * 1000)
    
    console.log(`New poll created: ${data.question}`)
    io.emit('poll:update', currentPoll)
  })
  
  socket.on('student:submit-answer', (data) => {
    if (!currentPoll || !currentPoll.isActive) {
      socket.emit('error', { message: 'No active poll' })
      return
    }
    
    const student = students.get(socket.studentId)
    if (!student) {
      socket.emit('error', { message: 'Student not found' })
      return
    }
    
    if (student.hasAnswered) {
      socket.emit('error', { message: 'Already answered' })
      return
    }
    
    const option = currentPoll.options.find(opt => opt.id === data.optionId)
    if (!option) {
      socket.emit('error', { message: 'Invalid option' })
      return
    }
    
    option.votes++
    student.hasAnswered = true
    student.answer = data.optionId
    
    calculateResults(currentPoll)
    
    console.log(`Student ${student.name} answered: ${option.text}`)
    io.emit('poll:update', currentPoll)
    io.emit('student:list', Array.from(students.values()))
    
    const allAnswered = Array.from(students.values()).every(s => s.hasAnswered)
    if (allAnswered && pollTimer) {
      clearTimeout(pollTimer)
      setTimeout(() => {
        endPoll()
      }, 2000) }
  })
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    if (socket.studentId) {
      students.delete(socket.studentId)
      io.emit('student:list', Array.from(students.values()))
    }
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

