const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../../config/db')

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
}

const register = async ({ name, email, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    const error = new Error('Email already in use')
    error.statusCode = 409
    throw error
  }

  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role || 'VIEWER' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  const token = generateToken(user)
  return { user, token }
}

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.isActive) {
    const error = new Error('Invalid credentials or account inactive')
    error.statusCode = 401
    throw error
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    const error = new Error('Invalid credentials')
    error.statusCode = 401
    throw error
  }

  const token = generateToken(user)

  const { password: _, ...safeUser } = user
  return { user: safeUser, token }
}

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  })

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  return user
}

module.exports = { register, login, getMe }