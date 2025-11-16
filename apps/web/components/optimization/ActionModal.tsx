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
  context?: any // Full context object from analyzer
}

export default function ActionModal({ 
  isOpen, 
  onClose, 
  task, 
  dashboardId, 
  brandName,
  context 
}: ActionModalProps) {
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Generation failed:', response.status, errorData)
        setGeneratedCode(`// Error: ${response.status} ${response.statusText}\n// ${errorData.error || 'Unknown error'}\n// Please check console for details`)
        return
      }
      
      const data = await response.json()
      setGeneratedCode(data.code || data.content || '')
    } catch (error) {
      console.error('Generation failed:', error)
      setGeneratedCode(`// Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}\n// Please check console and try again`)
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
    const moduleColor = task.module === 'brand' ? '[#4EE4FF]' : '[#00C6B7]'
    switch (impact) {
      case 'high': return `bg-${moduleColor}/10 text-${moduleColor} border-${moduleColor}/30`
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'low': return 'bg-secondary/10 text-secondary/60 border-secondary/30'
      default: return 'bg-secondary/10 text-secondary/60'
    }
  }

  const getModuleColor = () => {
    return task.module === 'brand' ? '#4EE4FF' : '#00C6B7'
  }

  // Render context-specific info box
  const renderContextInfo = () => {
    if (!context) return null

    // SHOPPING CONTEXT
    if (task.module === 'shopping') {
      const products = context.affected_products || []
      const categories = context.missing_categories || []

      if (products.length > 0) {
        return (
          <div className="pl-10 mb-6">
            <div className="bg-[#00C6B7]/5 border border-[#00C6B7]/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primary mb-3">
                Products that need attention:
              </h4>
              <div className="space-y-2">
                {products.map((product: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-[#00C6B7] font-mono">•</span>
                    <div>
                      <span className="text-primary font-medium">{product.product_name}</span>
                      <span className="text-secondary/60 ml-2">
                        ({product.categories.length} {product.categories.length === 1 ? 'category' : 'categories'})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      if (categories.length > 0) {
        return (
          <div className="pl-10 mb-6">
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primary mb-3">
                Missing categories to target:
              </h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded text-sm text-orange-400">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      }
    }

    // BRAND CONTEXT
    if (task.module === 'brand') {
      // Negative descriptors
      if (task.id === 'improve-negative-sentiment' && context.negative_descriptors?.length > 0) {
        return (
          <div className="pl-10 mb-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primary mb-3">
                Negative descriptors found ({context.negative_count} total):
              </h4>
              <div className="flex flex-wrap gap-2">
                {context.negative_descriptors.map((desc: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">
                    {desc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      }

      // Positive descriptors
      if (task.id === 'boost-positive-descriptors' && context.positive_descriptors?.length > 0) {
        return (
          <div className="pl-10 mb-6">
            <div className="bg-[#4EE4FF]/5 border border-[#4EE4FF]/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primary mb-3">
                Positive descriptors to reinforce ({context.positive_count} total):
              </h4>
              <div className="flex flex-wrap gap-2">
                {context.positive_descriptors.map((desc: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-[#4EE4FF]/10 border border-[#4EE4FF]/30 rounded text-sm text-[#4EE4FF]">
                    {desc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      }

      // Visibility score
      if ((task.id === 'add-organization-schema' || task.id === 'add-brand-authority-links') && context.current_visibility !== undefined) {
        return (
          <div className="pl-10 mb-6">
            <div className="bg-[#4EE4FF]/5 border border-[#4EE4FF]/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary/70">Current Visibility Index:</span>
                <span className="text-2xl font-heading font-bold text-[#4EE4FF]">{context.current_visibility}</span>
              </div>
              {context.current_visibility < 50 && (
                <p className="text-sm text-secondary/60 mt-2">
                  This is below average. Implementing this will help AI models discover and understand your brand better.
                </p>
              )}
            </div>
          </div>
        )
      }

      // Scattered descriptors
      if (task.id === 'unify-brand-language' && context.descriptor_count) {
        return (
          <div className="pl-10 mb-6">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary/70">Different descriptors found:</span>
                <span className="text-xl font-heading font-bold text-blue-400">{context.descriptor_count}</span>
              </div>
              <p className="text-sm text-secondary/60">
                {context.scattered 
                  ? 'Your brand language is scattered across many terms. Focus on 3-5 core descriptors.' 
                  : 'Some consolidation will help AI understand your brand positioning better.'}
              </p>
            </div>
          </div>
        )
      }
    }

    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card rounded-xl border border-border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between z-10">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}
              style={{ backgroundColor: `${getModuleColor()}15` }}>
              <IconComponent className="w-6 h-6" style={{ color: getModuleColor() }} strokeWidth={1.5} />
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
            className="cursor-pointer text-secondary/60 hover:text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Step 0: Context Info (NEW!) */}
          {renderContextInfo()}

          {/* Step 1: Why This Matters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${getModuleColor()}15` }}>
                <span className="text-sm font-heading font-bold" style={{ color: getModuleColor() }}>1</span>
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
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${getModuleColor()}15` }}>
                  <span className="text-sm font-heading font-bold" style={{ color: getModuleColor() }}>2</span>
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
                    style={{ 
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      backgroundColor: getModuleColor()
                    }}
                    className="px-6 py-3 hover:opacity-90 text-white rounded-lg font-medium transition-opacity disabled:opacity-50 flex items-center gap-2"
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
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-card hover:bg-hover border border-border rounded-lg text-sm font-medium transition-colors"
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
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${getModuleColor()}15` }}>
                <span className="text-sm font-heading font-bold" style={{ color: getModuleColor() }}>
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
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${getModuleColor()}15` }}>
                  <span className="text-sm font-heading font-bold" style={{ color: getModuleColor() }}>
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
                    className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-primary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-offset-0"
                    style={{ '--tw-ring-color': getModuleColor() } as any}
                  />
                  <button
                    onClick={handleValidate}
                    disabled={!validationUrl || validationResult === 'loading'}
                    style={{ 
                      cursor: (!validationUrl || validationResult === 'loading') ? 'not-allowed' : 'pointer',
                      backgroundColor: getModuleColor()
                    }}
                    className="px-6 py-2 hover:opacity-90 text-white rounded-lg font-medium transition-opacity disabled:opacity-50 flex items-center gap-2"
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
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex items-center justify-between z-10">
          <a
            href="https://docs.harbor.com/help"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-secondary/60 hover:opacity-80 transition-opacity flex items-center gap-1"
            style={{ color: getModuleColor() }}
          >
            Need help? <ExternalLink className="w-4 h-4" />
          </a>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="cursor-pointer px-6 py-2 border border-border hover:bg-hover rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // TODO: Mark task as complete in DB
                onClose()
              }}
              disabled={validationResult !== 'success'}
              style={{ 
                cursor: validationResult !== 'success' ? 'not-allowed' : 'pointer',
                backgroundColor: getModuleColor()
              }}
              className="px-6 py-2 hover:opacity-90 text-white rounded-lg font-medium transition-opacity disabled:opacity-50"
            >
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}