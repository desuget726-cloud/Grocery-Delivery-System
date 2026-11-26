const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')
const { logAudit } = require('../utils/auditLogger')
const { httpError, requiredString, safeUser } = require('../utils/http')

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  avatar: true,
  status: true,
  loyaltyTier: true,
  isOnline: true,
  vehicleType: true,
  plateNumber: true,
  assignedZone: true,
  rating: true,
  codCashHeld: true,
  createdAt: true,
}

function issueToken(user) {
  if (!process.env.JWT_SECRET) throw httpError(500, 'JWT_SECRET is not configured')
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function authResponse(user) {
  return { token: issueToken(user), user: safeUser(user) }
}

exports.register = async (req, res) => {
  const fullName = requiredString(req.body.fullName, 'fullName')
  const email = requiredString(req.body.email, 'email').toLowerCase()
  const password = requiredString(req.body.password, 'password')
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError(400, 'A valid email is required')
  if (password.length < 8) throw httpError(400, 'Password must be at least 8 characters')
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    throw httpError(409, 'An account with this email already exists')
  }

  try {
    const user = await prisma.user.create({
      data: { fullName, email, phone, passwordHash: await bcrypt.hash(password, 12), role: 'CUSTOMER' },
      select: userSelect,
    })
    return res.status(201).json(authResponse(user))
  } catch (error) {
    if (error.code === 'P2002') throw httpError(409, 'An account with this email already exists')
    throw error
  }
}

exports.login = async (req, res) => {
  const email = requiredString(req.body.email, 'email').toLowerCase()
  const password = requiredString(req.body.password, 'password')
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw httpError(401, 'Invalid email or password')
  }
  if (user.status === 'SUSPENDED') throw httpError(403, 'This account has been suspended')
  const response = authResponse(user)
  if (user.role === 'ADMIN') {
    await logAudit({
      req,
      user,
      action: 'ADMIN_LOGIN',
      entity: 'User',
      entityId: user.id,
      details: 'Administrator signed in.',
    })
  }
  return res.json(response)
}

exports.me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { ...userSelect, addresses: { orderBy: { isDefault: 'desc' } } },
  })
  return res.json({ user })
}

exports.updateProfile = async (req, res) => {
  const data = {}
  for (const field of ['fullName', 'phone', 'avatar']) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      if (req.body[field] !== null && typeof req.body[field] !== 'string') {
        throw httpError(400, `${field} must be a string or null`)
      }
      data[field] = req.body[field] === null ? null : req.body[field].trim()
      if (field === 'fullName' && !data[field]) throw httpError(400, 'fullName cannot be empty')
    }
  }
  if (!Object.keys(data).length) throw httpError(400, 'Provide at least one profile field to update')
  const user = await prisma.user.update({ where: { id: req.user.id }, data, select: userSelect })
  return res.json({ user })
}

exports.changePassword = async (req, res) => {
  const currentPassword = requiredString(req.body.currentPassword, 'currentPassword')
  const newPassword = requiredString(req.body.newPassword, 'newPassword')
  if (newPassword.length < 8) throw httpError(400, 'New password must be at least 8 characters')
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw httpError(400, 'Current password is incorrect')
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12), resetOtp: null, resetOtpExpires: null },
  })
  await logAudit({
    req,
    user: req.user,
    action: 'CHANGE_PASSWORD',
    entity: 'User',
    entityId: user.id,
    details: 'Password changed.',
  })
  return res.json({ message: 'Password changed successfully' })
}

exports.createAddress = async (req, res) => {
  const label = requiredString(req.body.label, 'label')
  const zone = requiredString(req.body.zone, 'zone')
  const street = requiredString(req.body.street, 'street')
  const address = await prisma.$transaction(async (tx) => {
    const count = await tx.address.count({ where: { userId: req.user.id } })
    if (req.body.isDefault === true || count === 0) {
      await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } })
    }
    return tx.address.create({
      data: { userId: req.user.id, label, zone, street, isDefault: req.body.isDefault === true || count === 0 },
    })
  })
  return res.status(201).json({ address })
}

exports.setDefaultAddress = async (req, res) => {
  const address = await prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({ where: { id: req.params.id, userId: req.user.id } })
    if (!existing) throw httpError(404, 'Address not found')
    await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } })
    return tx.address.update({ where: { id: existing.id }, data: { isDefault: true } })
  })
  return res.json({ address })
}

exports.deleteAddress = async (req, res) => {
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({ where: { id: req.params.id, userId: req.user.id } })
    if (!existing) throw httpError(404, 'Address not found')
    await tx.address.delete({ where: { id: existing.id } })
    if (existing.isDefault) {
      const next = await tx.address.findFirst({ where: { userId: req.user.id }, orderBy: { id: 'asc' } })
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } })
    }
    return existing.id
  })
  return res.json({ message: 'Address deleted', id: result })
}

exports.forgotPassword = async (req, res) => {
  const email = requiredString(req.body.email, 'email').toLowerCase()
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  let devOtp
  if (user) {
    devOtp = crypto.randomInt(100000, 1000000).toString()
    const resetOtp = crypto.createHash('sha256').update(devOtp).digest('hex')
    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtp, resetOtpExpires: new Date(Date.now() + 15 * 60 * 1000) },
    })
  }

  const response = { message: 'If an account exists for this email, password reset instructions will be sent.' }
  if (process.env.NODE_ENV !== 'production' && devOtp) response.developmentOtp = devOtp
  return res.json(response)
}

exports.verifyOtp = async (req, res) => {
  const email = requiredString(req.body.email, 'email').toLowerCase()
  const otp = requiredString(req.body.otp, 'otp')
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.resetOtp || !user.resetOtpExpires || user.resetOtpExpires <= new Date()) {
    throw httpError(400, 'The verification code is invalid or expired')
  }
  const provided = crypto.createHash('sha256').update(otp).digest()
  const stored = Buffer.from(user.resetOtp, 'hex')
  if (provided.length !== stored.length || !crypto.timingSafeEqual(provided, stored)) {
    throw httpError(400, 'The verification code is invalid or expired')
  }
  return res.json({ verified: true, message: 'Verification code is valid' })
}

exports.resetPassword = async (req, res) => {
  const email = requiredString(req.body.email, 'email').toLowerCase()
  const otp = requiredString(req.body.otp, 'otp')
  const password = requiredString(req.body.newPassword || req.body.password, 'newPassword')
  if (password.length < 8) throw httpError(400, 'Password must be at least 8 characters')
  const user = await prisma.user.findUnique({ where: { email } })
  const hash = user && user.resetOtp ? crypto.createHash('sha256').update(otp).digest() : null
  const stored = user && user.resetOtp ? Buffer.from(user.resetOtp, 'hex') : null
  if (
    !user ||
    !stored ||
    !user.resetOtpExpires ||
    user.resetOtpExpires <= new Date() ||
    hash.length !== stored.length ||
    !crypto.timingSafeEqual(hash, stored)
  ) {
    throw httpError(400, 'The verification code is invalid or expired')
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(password, 12), resetOtp: null, resetOtpExpires: null },
  })
  await logAudit({
    req,
    user,
    action: 'RESET_PASSWORD',
    entity: 'User',
    entityId: user.id,
    details: 'Password reset using a verified recovery code.',
  })
  return res.json({ message: 'Password reset successfully' })
}
