"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const LoginPageContent = () => {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/exchange'
  const referralParam = searchParams.get('ref')

  const { requestOtp, verifyOtp, isAuthenticated, error, clearError } = useAuth()

  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone')
  const [otpValues, setOtpValues] = useState(() => Array(4).fill(''))
  const [timer, setTimer] = useState(40)
  const [isRequesting, setIsRequesting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  const [requiresName, setRequiresName] = useState(false)
  const [pendingOtp, setPendingOtp] = useState('')
  const [referralCode, setReferralCode] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      // Use window.location for full page reload to ensure cookies are read
      window.location.href = redirectTo
    }
  }, [isAuthenticated, redirectTo])

  useEffect(() => {
    if (referralParam) {
      setReferralCode(referralParam.trim().toUpperCase())
    }
  }, [referralParam])

  const handlePhoneNumberChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, 10)
    setPhoneNumber(sanitized)
  }

  const trimmedName = name.trim()
  const isNameValid = trimmedName.length >= 2 && trimmedName.length <= 50
  const isPhoneValid = phoneNumber.length === 10
  const isOtpComplete = otpValues.every((digit) => digit.trim().length === 1)

  const maskedNumber = phoneNumber.length
    ? `${phoneNumber.slice(0, 2)}****${phoneNumber.slice(-4)}`
    : ''

  useEffect(() => {
    if (step === 'otp') {
      const countdown = window.setInterval(() => {
        setTimer((current) => {
          if (current <= 1) {
            window.clearInterval(countdown)
            return 0
          }
          return current - 1
        })
      }, 1000)
      inputsRef.current[0]?.focus()
      return () => window.clearInterval(countdown)
    }
  }, [step])

  const handleRequestOtp = useCallback(async () => {
    if (!isPhoneValid || isRequesting) return
    setIsRequesting(true)
    clearError()
    try {
      const response = await requestOtp(phoneNumber)
      // Only proceed to OTP step if request was successful
      if (response && response.expiresAt) {
        setStep('otp')
        setDevOtp(response.devOtp ?? null)
        const expiresInSeconds = Math.max(0, Math.floor((response.expiresAt - Date.now()) / 1000))
        setTimer(expiresInSeconds || 40)
        setOtpValues(Array(4).fill(''))
        setRequiresName(Boolean(response.requiresName))
        setPendingOtp('')
        setName('')
      } else {
        // If response doesn't have expiresAt, it's an error - but this shouldn't happen
        // The error should already be set by requestOtp
      }
    } catch {
      // Error is already set by requestOtp in AuthContext
      // The catch block ensures we don't proceed if there's an error
    } finally {
      setIsRequesting(false)
    }
  }, [isPhoneValid, isRequesting, clearError, requestOtp, phoneNumber])

  const handleOtpChange = (index: number, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '').slice(0, 1)
    setOtpValues((prev) => {
      const next = [...prev]
      next[index] = sanitized
      return next
    })

    if (sanitized && index < otpValues.length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleConfirmOtp = useCallback(async () => {
    if (!isOtpComplete || isVerifying) return
    const code = otpValues.join('')

    if (requiresName) {
      // Store OTP and move to name step
      // We'll verify OTP when submitting name to avoid expiration issues
      setPendingOtp(code)
      setStep('name')
      return
    }

    setIsVerifying(true)
    clearError()
    try {
      await verifyOtp(phoneNumber, code, undefined, referralCode || undefined)
      // Don't redirect here - let the useEffect handle it when isAuthenticated becomes true
      // This ensures the cookie is properly set before redirect
    } catch (err) {
      // Error is already set by verifyOtp in AuthContext
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP'
      if (errorMessage.includes('expired') || errorMessage.includes('not requested')) {
        // If OTP expired or not found, go back to phone step to request new OTP
        setStep('phone')
        setOtpValues(Array(4).fill(''))
        setPendingOtp('')
      }
    } finally {
      setIsVerifying(false)
    }
  }, [isOtpComplete, isVerifying, requiresName, clearError, verifyOtp, phoneNumber, otpValues, referralCode])

  const handleSubmitName = useCallback(async () => {
    if (!pendingOtp || !isNameValid || isVerifying) return
    setIsVerifying(true)
    clearError()
    try {
      await verifyOtp(phoneNumber, pendingOtp, trimmedName, referralCode || undefined)
      // Don't redirect here - let the useEffect handle it when isAuthenticated becomes true
      // This ensures the cookie is properly set before redirect
    } catch (err) {
      // If OTP verification fails (expired, invalid, etc.), show error
      // Error is already set by verifyOtp in AuthContext
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP'
      if (errorMessage.includes('expired') || errorMessage.includes('not requested')) {
        // If OTP expired or not found, go back to phone step to request new OTP
        setStep('phone')
        setPendingOtp('')
        setOtpValues(Array(4).fill(''))
        setRequiresName(false)
      } else {
        // For other errors, go back to OTP step so user can try again
        setStep('otp')
        setPendingOtp('')
        setOtpValues(Array(4).fill(''))
      }
    } finally {
      setIsVerifying(false)
    }
  }, [pendingOtp, isNameValid, isVerifying, clearError, verifyOtp, phoneNumber, trimmedName, referralCode])

  return (
    <main className='relative min-h-screen overflow-hidden bg-gradient-to-br from-[#05080d] via-[#0b1220] to-[#06090f] text-white'>
      <div className='absolute inset-0 -z-10 overflow-hidden'>
        <div className='absolute -top-48 -left-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl opacity-60' />
        <div className='absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl opacity-50' />
      </div>

      {showAnnouncement && (
        <div className='border-b border-white/10 bg-black/50 px-6 py-3 text-sm backdrop-blur-lg'>
          <div className='mx-auto flex w-full max-w-3xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left'>
            <div className='flex items-center gap-2 text-white/80'>
              <Icon icon='mdi:google-play' className='text-primary text-xl' />
              <span className='font-medium tracking-wide'>Official app only supports Android</span>
            </div>
            <div className='flex items-center gap-3'>
              <Link
                href='/api/download/apk'
                  download='crypgox.apk'
                className='flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-background transition hover:bg-primary/80'
              >
                <Icon icon='mdi:download-circle' className='text-base' />
                Download app
              </Link>
              <button
                type='button'
                className='text-white/60 transition hover:text-white'
                onClick={() => setShowAnnouncement(false)}
                aria-label='Dismiss announcement'
              >
                <Icon icon='solar:close-circle-linear' className='text-xl' />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='mx-auto flex min-h-screen w-full max-w-lg flex-col px-6 pb-6 pt-20 sm:pt-24'>
        <div className='mb-10 flex items-center justify-between text-sm text-white/60'>
          <Link href='/' className='flex items-center gap-2 transition hover:text-white'>
            <Icon icon='solar:arrow-left-linear' className='text-2xl' />
            <span>Back</span>
          </Link>
        </div>

        <section className='w-full rounded-[32px] bg-white/5 p-8 shadow-[0_24px_60px_rgba(8,15,35,0.45)] backdrop-blur-xl'>
          <div className='space-y-8'>
            <div className='space-y-2 text-left'>
              <h1 className='text-3xl font-semibold sm:text-4xl'>Login account</h1>
              <p className='text-sm text-white/60'>
                {step === 'phone'
                  ? 'Please enter your mobile number'
                  : step === 'otp'
                    ? 'Please enter SMS OTP'
                    : 'Almost done, tell us your name'}
              </p>
            </div>

            {step === 'phone' ? (
              <form className='space-y-6' onSubmit={(event) => event.preventDefault()}>
                <label className='flex flex-col gap-3 text-sm text-white/60'>
                  <span>Mobile number</span>
                  <div className='flex items-center gap-3 rounded-2xl bg-black/40 px-5 py-4 text-white shadow-inner shadow-black/10'>
                    <div className='flex items-center gap-2 border-r border-white/10 pr-3 font-medium text-white'>
                      <Image src='/flag.png' alt='India flag' width={24} height={24} className='rounded-full' />
                      <span>+91</span>
                    </div>
                    <input
                      type='tel'
                      value={phoneNumber}
                      onChange={(event) => handlePhoneNumberChange(event.target.value)}
                      className='w-full bg-transparent text-base font-medium text-white placeholder:text-white/30 focus:outline-none'
                      placeholder='Enter number'
                      inputMode='numeric'
                      pattern='[0-9]*'
                      maxLength={10}
                    />
                  </div>
                </label>
                {error && (
                  <div className='text-xs text-red-400 bg-red-500/10 border border-red-400/20 rounded-lg px-4 py-2'>
                    {error}
                  </div>
                )}
                <button
                  type='button'
                  onClick={handleRequestOtp}
                  className={`w-full rounded-full py-4 text-base font-semibold transition ${isPhoneValid
                    ? 'bg-primary text-background shadow-[0_14px_28px_rgba(16,185,129,0.35)] hover:bg-primary/80'
                    : 'bg-white/10 text-white/40'
                    }`}
                  disabled={!isPhoneValid || isRequesting}
                >
                  {isRequesting ? 'Sending…' : 'Next'}
                </button>
              </form>
            ) : step === 'otp' ? (
              <div className='space-y-8'>
                <div className='space-y-2 text-sm text-white/60'>
                  <p>
                    SMS OTP sent to <span className='font-semibold text-white'>+91 {maskedNumber}</span>
                  </p>
                  {requiresName && (
                    <p className='text-white/50'>We will ask for your name after verifying the OTP.</p>
                  )}
                </div>
                <div className='flex items-center justify-between gap-3'>
                  {otpValues.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        inputsRef.current[index] = element
                      }}
                      type='text'
                      inputMode='numeric'
                      value={digit}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      maxLength={1}
                      className='h-14 w-full max-w-[52px] rounded-2xl border border-white/15 bg-black/50 text-center text-xl font-semibold text-white focus:border-primary focus:outline-none'
                    />
                  ))}
                </div>
                {devOtp && (
                  <div className='text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 rounded-lg px-4 py-2'>
                    Dev OTP: <span className='font-mono tracking-[0.3em]'>{devOtp}</span>
                  </div>
                )}
                {error && (
                  <div className='text-xs text-red-400 bg-red-500/10 border border-red-400/20 rounded-lg px-4 py-2'>
                    {error}
                  </div>
                )}
                <div className='flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/40'>
                  <span>{timer > 0 ? `After ${timer}s` : 'Resend available'}</span>
                  <button
                    type='button'
                    className='text-white/60 underline-offset-4 transition hover:text-white'
                    disabled={timer > 0 || isRequesting}
                    onClick={() => {
                      if (timer > 0) return
                      handleRequestOtp()
                    }}
                  >
                    Resend
                  </button>
                </div>
                <button
                  type='button'
                  onClick={handleConfirmOtp}
                  className={`w-full rounded-full py-4 text-base font-semibold transition ${isOtpComplete
                    ? 'bg-primary text-background shadow-[0_14px_28px_rgba(16,185,129,0.35)] hover:bg-primary/80'
                    : 'bg-white/10 text-white/40'
                    }`}
                  disabled={!isOtpComplete || isVerifying}
                >
                  {requiresName ? 'Next' : isVerifying ? 'Verifying…' : 'Confirm'}
                </button>
              </div>
            ) : (
              <div className='space-y-6'>
                <p className='text-sm text-white/60'>Enter your full name to complete setup.</p>
                {error && (
                  <div className='text-xs text-red-400 bg-red-500/10 border border-red-400/20 rounded-lg px-4 py-2'>
                    {error}
                  </div>
                )}
                <label className='flex flex-col gap-3 text-sm text-white/60'>
                  <span>Full name</span>
                  <input
                    type='text'
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className='rounded-2xl bg-black/40 px-5 py-4 text-base font-medium text-white placeholder:text-white/30 focus:outline-none'
                    placeholder='Enter full name'
                    maxLength={50}
                  />
                  {!isNameValid && name.length > 0 && (
                    <span className='text-xs text-red-400'>Name must be 2-50 characters</span>
                  )}
                </label>
                <label className='flex flex-col gap-3 text-sm text-white/60'>
                  <span>Referral code <span className='text-white/40'>(optional)</span></span>
                  <input
                    type='text'
                    value={referralCode}
                    onChange={(event) => setReferralCode(event.target.value.trim().toUpperCase())}
                    className='rounded-2xl bg-black/40 px-5 py-4 text-base font-medium text-white placeholder:text-white/30 focus:outline-none uppercase tracking-[0.3em]'
                    placeholder='Enter code'
                    maxLength={16}
                  />
                </label>
                <div className='flex items-center gap-3 text-xs text-white/50'>
                  <button
                    type='button'
                    className='underline-offset-4 transition hover:text-white'
                    onClick={() => {
                      setStep('otp')
                      setName('')
                      clearError()
                    }}
                  >
                    Back to OTP
                  </button>
                </div>
                <button
                  type='button'
                  onClick={handleSubmitName}
                  className={`w-full rounded-full py-4 text-base font-semibold transition ${isNameValid
                    ? 'bg-primary text-background shadow-[0_14px_28px_rgba(16,185,129,0.35)] hover:bg-primary/80'
                    : 'bg-white/10 text-white/40'
                    }`}
                  disabled={!isNameValid || isVerifying}
                >
                  {isVerifying ? 'Completing…' : 'Finish'}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-[#05080d] via-[#0b1220] to-[#06090f] text-white'>
          Loading…
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
