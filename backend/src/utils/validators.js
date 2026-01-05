const { z } = require('zod')

const phoneSchema = z
  .string({ required_error: 'Phone number is required' })
  .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits')

const otpSchema = z
  .string({ required_error: 'OTP is required' })
  .regex(/^[0-9]{4}$/, 'OTP must be 4 digits')

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be at most 50 characters')

const referralCodeSchema = z
  .string()
  .trim()
  .min(4, 'Referral code must be at least 4 characters')
  .max(16, 'Referral code must be at most 16 characters')
  .regex(/^[A-Za-z0-9]+$/, 'Referral code must be alphanumeric')

const requestOtpSchema = z.object({
  phone: phoneSchema,
})

const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
  name: nameSchema.optional(),
  referralCode: referralCodeSchema.optional(),
})

module.exports = {
  phoneSchema,
  otpSchema,
  requestOtpSchema,
  verifyOtpSchema,
  referralCodeSchema,
}
