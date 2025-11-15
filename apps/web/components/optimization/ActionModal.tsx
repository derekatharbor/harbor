// components/optimization/ActionModal.tsx
'use client'

import { useState } from 'react'
import { X, Copy, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { OptimizationTask } from '@/lib/optimization/tasks'
import * as LucideIcons from 'lucide-react'

interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  task: OptimizationTask
  dashboardId: string
  brandName: string
}

export default function ActionModal({ isOpen, onClose, task, dashboardId, brandName }: ActionModalProps) {
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [validationUrl, setValidationUrl] = useState('')
  const [validationResult, setValidationResult] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [validationMessage, setValidationMessage] = useState('')
  
  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[task.icon] || LucideIcons.ShoppingBag

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!task.hasGenerator || !task.generatorEndpoint) return
    
    setIsGenerating(true)
    try {
      const response = await fetch(task.generatorEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId,
          brandName,
          taskId: task.id
        })
      })
      
      const data = await response.json()
      setGeneratedCode(data.code || data.content || '')
    } catch (error) {
      console.error('Generation failed:', error)
      setGeneratedCode('// Error generating code. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const handleValidate = async () => {
    if (!task.hasValidator || !task.validatorEndpoint || !validationUrl) return
    
    setValidationResult('loading')
    setValidationMessage('')
    
    try {
      const response = await fetch(task.validatorEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: validationUrl,
          taskId: task.id
        })
      })
      
      const data = await response.json()
      
      if (data.valid) {
        setValidationResult('success')
        setValidationMessage(data.message || 'Schema detected! You\'re all set.')
      } else {
        setValidationResult('error')
        setValidationMessage(data.message || 'Schema not found. Make sure you saved and published your changes.')
      }
    } catch (error) {
      setValidationResult('error')
      setValidationMessage('Validation failed. Please check the URL and try again.')
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-orange-400'
      default: return 'text-secondary/60'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-[#00C6B7]/10 text-[#00C6B7] border-[#00C6B7]/30'
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'low': return 'bg-secondary/10 text-secondary/60 border-secondary/30'
      default: return 'bg-secondary/10 text-secondary/60'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background rounded-xl border border-border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#00C6B7]/10 flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-6 h-6 text-[#00C6B7]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-primary mb-2">
                {task.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded border ${getImpactColor(task.impact)}`}>
                  {task.impact.toUpperCase()} IMPACT
                </span>
                <span className={`text-xs ${getDifficultyColor(task.difficulty)}`}>
                  {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)} difficulty
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-secondary/60 hover:text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Step 1: Why This Matters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#00C6B7]/10 flex items-center justify-center">
                <span className="text-sm font-heading font-bold text-[#00C6B7]">1</span>
              </div>
              <h3 className="text-lg font-heading font-bold text-primary">
                Why This Matters
              </h3>
            </div>
            <p className="text-secondary/80 leading-relaxed pl-10">
              {task.whyMatters}
            </p>
          </div>

          {/* Step 2: Generate/Copy Code */}
          {task.hasGenerator && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00C6B7]/10 flex items-center justify-center">
                  <span className="text-sm font-heading font-bold text-[#00C6B7]">2</span>
                </div>
                <h3 className="text-lg font-heading font-bold text-primary">
                  Get the Code
                </h3>
              </div>
              
              <div className="pl-10 space-y-3">
                {!generatedCode && (
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-[#00C6B7] hover:bg-[#00C6B7]/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>Generate Code for {brandName}</>
                    )}
                  </button>
                )}
                
                {generatedCode && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-secondary/60">
                        Copy this code and paste it into your website
                      </p>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-hover border border-border rounded-lg text-sm font-medium transition-colors"
                      >
                        {copySuccess ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4 font-mono text-sm text-secondary/80 overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{generatedCode}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Where to Do It */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#00C6B7]/10 flex items-center justify-center">
                <span className="text-sm font-heading font-bold text-[#00C6B7]">
                  {task.hasGenerator ? '3' : '2'}
                </span>
              </div>
              <h3 className="text-lg font-heading font-bold text-primary">
                Where to Put It
              </h3>
            </div>
            <div className="pl-10 space-y-2">
              {task.whereToDoIt.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <span className="text-secondary/40 font-mono text-sm mt-0.5">
                    {index + 1}.
                  </span>
                  <p className="text-secondary/80 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Validate */}
          {task.hasValidator && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00C6B7]/10 flex items-center justify-center">
                  <span className="text-sm font-heading font-bold text-[#00C6B7]">
                    {task.hasGenerator ? '4' : '3'}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-bold text-primary">
                  Check If It Worked
                </h3>
              </div>
              
              <div className="pl-10 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={validationUrl}
                    onChange={(e) => setValidationUrl(e.target.value)}
                    placeholder="https://yourwebsite.com/product-page"
                    className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-primary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-[#00C6B7]/50"
                  />
                  <button
                    onClick={handleValidate}
                    disabled={!validationUrl || validationResult === 'loading'}
                    className="px-6 py-2 bg-[#00C6B7] hover:bg-[#00C6B7]/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {validationResult === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>Test</>
                    )}
                  </button>
                </div>
                
                {validationResult === 'success' && (
                  <div className="flex gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-green-400 text-sm">{validationMessage}</p>
                  </div>
                )}
                
                {validationResult === 'error' && (
                  <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{validationMessage}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border p-6 flex items-center justify-between">
          <a
            href="https://docs.harbor.com/help"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-secondary/60 hover:text-[#00C6B7] transition-colors flex items-center gap-1"
          >
            Need help? <ExternalLink className="w-4 h-4" />
          </a>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-border hover:bg-hover rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // TODO: Mark task as complete in DB
                onClose()
              }}
              disabled={validationResult !== 'success'}
              className="px-6 py-2 bg-[#00C6B7] hover:bg-[#00C6B7]/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}