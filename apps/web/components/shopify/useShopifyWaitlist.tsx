// components/shopify/useShopifyWaitlist.tsx
'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface WaitlistState {
  email: string
  setEmail: (email: string) => void
  isSubmitting: boolean
  isSubmitted: boolean
  position: number | null
  referralCode: string | null
  referralCount: number
  totalSignups: number
  error: string | null
  handleSubmit: (e: React.FormEvent) => Promise<void>
  referralLink: string
  copyReferralLink: () => void
  copied: boolean
  shareToLinkedIn: () => void
  shareToTwitter: () => void
}

const WaitlistContext = createContext<WaitlistState | null>(null)

export function ShopifyWaitlistProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralCount, setReferralCount] = useState(0)
  const [totalSignups, setTotalSignups] = useState(847)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      sessionStorage.setItem('shopify_referrer', ref)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const referredBy = sessionStorage.getItem('shopify_referrer')
      
      const response = await fetch('/api/waitlist/shopify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, referredBy })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setPosition(data.position)
      setReferralCode(data.referralCode)
      setReferralCount(data.referralCount || 0)
      setTotalSignups(data.totalSignups || totalSignups + 1)
      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const referralLink = referralCode 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shopify?ref=${referralCode}`
    : ''

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(referralLink)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  const shareToTwitter = () => {
    const text = encodeURIComponent("Just joined the waitlist for Harbor's Shopify plugin — AI visibility for e-commerce")
    const url = encodeURIComponent(referralLink)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  return (
    <WaitlistContext.Provider value={{
      email,
      setEmail,
      isSubmitting,
      isSubmitted,
      position,
      referralCode,
      referralCount,
      totalSignups,
      error,
      handleSubmit,
      referralLink,
      copyReferralLink,
      copied,
      shareToLinkedIn,
      shareToTwitter,
    }}>
      {children}
    </WaitlistContext.Provider>
  )
}

export function useShopifyWaitlist() {
  const context = useContext(WaitlistContext)
  if (!context) {
    throw new Error('useShopifyWaitlist must be used within ShopifyWaitlistProvider')
  }
  return context
}
