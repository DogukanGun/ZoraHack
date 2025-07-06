'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/Button'
import { Card, CardContent } from '~/components/ui/card'
import { ArrowLeft, Video, Wand2, Share, Loader2, Mail, X, Lock, Download, CreditCard, Coins, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMiniApp } from '@neynar/react'
import { executeMockZoraTrade, useNetworkCheck, useWalletStatus } from '~/lib/zora'
import { useConnect, useAccount } from 'wagmi'

export default function VideoPage() {
  const { isSDKLoaded } = useMiniApp()
  const miniApp = useMiniApp()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [numFrames, setNumFrames] = useState(25)
  const [numInferenceSteps, setNumInferenceSteps] = useState(7)
  const [seed, setSeed] = useState<number | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [email, setEmail] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isPaymentVerified, setIsPaymentVerified] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const router = useRouter()

  // Wallet and network hooks
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { isCorrectNetwork, getNetworkName } = useNetworkCheck()
  const { isWalletConnected } = useWalletStatus()

  const handleGenerateVideo = async () => {
    if (!prompt) return
    
    setIsGenerating(true)
    setErrorMessage(null)
    try {
      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('num_frames', numFrames.toString())
      formData.append('num_inference_steps', numInferenceSteps.toString())
      
      if (seed && seed > 0) {
        formData.append('seed', seed.toString())
      }
      
      const response = await fetch('http://localhost:8000/video/generate', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const videoUrl = URL.createObjectURL(blob)
        setGeneratedVideo(videoUrl)
        
        // Get video ID from response headers
        const videoIdFromHeader = response.headers.get('X-Video-ID')
        if (videoIdFromHeader) {
          setVideoId(videoIdFromHeader)
        }
        
        setErrorMessage('Video generated successfully! You can preview it above. Zora coin payment required for download.')
      } else {
        const errorText = await response.text()
        setErrorMessage(`Video generation failed: ${errorText}`)
        console.error('Video generation failed:', errorText)
      }
    } catch (error) {
      setErrorMessage(`Network error: ${error instanceof Error ? error.message : String(error)}`)
      console.error('Video generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleZoraPayment = async () => {
    if (!videoId) return
    
    setIsProcessingPayment(true)
    setErrorMessage(null)
    
    try {
      // Check wallet connection
      if (!isWalletConnected) {
        throw new Error('Please connect your wallet first')
      }

      // Check network
      if (!isCorrectNetwork) {
        throw new Error(`Please switch to ${getNetworkName()} network`)
      }

      // Execute Zora trade (using mock for testing)
      const paymentResult = await executeMockZoraTrade("0.001")
      
      // Verify payment with backend
      await verifyPaymentWithBackend(paymentResult)
      
      setIsPaymentVerified(true)
      setShowPaymentModal(false)
      setErrorMessage('Zora coin payment verified! You can now download your video.')
      
    } catch (error) {
      setErrorMessage(`Payment error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const verifyPaymentWithBackend = async (paymentResult: any) => {
    const formData = new FormData()
    formData.append('video_id', videoId!)
    formData.append('transaction_hash', paymentResult.transactionHash)
    formData.append('amount_paid', paymentResult.amountPaid)
    formData.append('user_address', paymentResult.userAddress)
    
    const response = await fetch('http://localhost:8000/video/verify-zora-payment', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Payment verification failed: ${errorText}`)
    }
  }

  const handleDownload = async () => {
    if (!videoId || !isPaymentVerified) return
    
    try {
      const formData = new FormData()
      formData.append('video_id', videoId)
      formData.append('payment_verified', 'true')
      
      const response = await fetch('http://localhost:8000/video/download', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `generated_video_${videoId}.mp4`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const errorText = await response.text()
        setErrorMessage(`Download failed: ${errorText}`)
      }
    } catch (error) {
      setErrorMessage(`Download error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleShare = async () => {
    if (!videoId || !isPaymentVerified) {
      setErrorMessage('Zora coin payment required before sharing via email.')
      return
    }
    setShowEmailModal(true)
  }

  const handleSendEmail = async () => {
    if (!email || !videoId || !isPaymentVerified) return
    
    setIsSendingEmail(true)
    setErrorMessage(null)
    
    try {
      // Get video data from backend
      const formData = new FormData()
      formData.append('video_id', videoId)
      formData.append('payment_verified', 'true')
      
      const videoResponse = await fetch('http://localhost:8000/video/download', {
        method: 'POST',
        body: formData,
      })
      
      if (!videoResponse.ok) {
        throw new Error('Cannot access video for email')
      }
      
      const videoBlob = await videoResponse.blob()
      
      // Create form data for email sending
      const emailFormData = new FormData()
      emailFormData.append('email', email)
      emailFormData.append('video', videoBlob, 'generated_video.mp4')
      emailFormData.append('prompt', prompt)
      
      // Send to backend email endpoint
      const emailResponse = await fetch('http://localhost:8000/video/send-email', {
        method: 'POST',
        body: emailFormData,
      })
      
      if (emailResponse.ok) {
        setErrorMessage('Video sent successfully to your email!')
        setShowEmailModal(false)
        setEmail('')
      } else {
        const errorText = await emailResponse.text()
        setErrorMessage(`Failed to send email: ${errorText}`)
      }
    } catch (error) {
      setErrorMessage(`Error sending email: ${error instanceof Error ? error.message : String(error)}`)
      console.error('Email sending failed:', error)
    } finally {
      setIsSendingEmail(false)
    }
  }

  const closeEmailModal = () => {
    setShowEmailModal(false)
    setEmail('')
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
  }

  const connectWallet = () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] })
    }
  }

  if (!isSDKLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button 
            onClick={() => router.back()}
            className="mr-4 bg-white/10 hover:bg-white/20 text-white border-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-white">Create Videos</h1>
        </div>

        {/* Wallet Connection Status */}
        {!isWalletConnected && (
          <Card className="max-w-2xl mx-auto mb-6 bg-yellow-500/20 border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-yellow-200 text-sm">Connect wallet to pay with Zora coins</span>
                </div>
                <Button 
                  onClick={connectWallet}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm"
                >
                  Connect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Network Status */}
        {isWalletConnected && !isCorrectNetwork && (
          <Card className="max-w-2xl mx-auto mb-6 bg-red-500/20 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Wallet className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-200 text-sm">
                  Please switch to {getNetworkName()} network for Zora coin payments
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Display error/success message */}
        {errorMessage && (
          <Card className={`${errorMessage.includes('Error') || errorMessage.includes('Failed') ? 'bg-red-500/20 border-red-500/30' : 'bg-green-500/20 border-green-500/30'} mb-4 max-w-2xl mx-auto`}>
            <CardContent className="p-4">
              <p className="text-white text-sm">{errorMessage}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Video className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">AI Video Generation</h2>
                <p className="text-gray-300">Create amazing videos from your text descriptions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Video Prompt</h3>
              <div className="space-y-4">
                <textarea
                  placeholder="Describe the video you want to create... (e.g., 'A beautiful sunset over mountains with birds flying')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Advanced Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Frames
                    </label>
                    <select
                      value={numFrames}
                      onChange={(e) => setNumFrames(parseInt(e.target.value))}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={17}>17 frames</option>
                      <option value={25}>25 frames</option>
                      <option value={33}>33 frames</option>
                      <option value={41}>41 frames</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Inference Steps
                    </label>
                    <select
                      value={numInferenceSteps}
                      onChange={(e) => setNumInferenceSteps(parseInt(e.target.value))}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={4}>4 steps</option>
                      <option value={5}>5 steps</option>
                      <option value={6}>6 steps</option>
                      <option value={7}>7 steps (default)</option>
                      <option value={8}>8 steps</option>
                      <option value={9}>9 steps</option>
                      <option value={10}>10 steps</option>
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateVideo}
                  disabled={isGenerating || !prompt}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 w-full"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating Video...' : 'Generate Video'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {isGenerating && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-white mb-2">Generating Your Video</h3>
                <p className="text-gray-300">This may take a few minutes...</p>
              </CardContent>
            </Card>
          )}

          {generatedVideo && (
            <div className="space-y-6">
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Generated Video</h3>
                  
                  {/* Video Preview */}
                  <video 
                    src={generatedVideo} 
                    controls
                    controlsList='nodownload'
                    disablePictureInPicture
                    className="w-full rounded-lg"
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ maxHeight: '400px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Payment Status */}
                  <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-yellow-400 mr-2" />
                      <span className="text-yellow-200 text-sm">
                        {isPaymentVerified ? 'Zora coin payment verified - Download available' : 'Zora coin payment required for download'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center space-x-4">
                {!isPaymentVerified ? (
                  <Button 
                    onClick={() => setShowPaymentModal(true)}
                    disabled={!isWalletConnected || !isCorrectNetwork}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Pay with Zora Coins
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Video
                    </Button>
                    <Button 
                      onClick={handleShare}
                      disabled={isSharing}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Share via Email
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tips for Better Videos</h3>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>• Be specific about scenes, objects, and actions</p>
                <p>• Include details about lighting, mood, and style</p>
                <p>• Mention camera movements or angles if desired</p>
                <p>• Keep descriptions clear and concise</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Share Video via Email</h3>
                  <Button
                    onClick={closeEmailModal}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 border-0 p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>We'll send your generated video as an attachment to your email.</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={closeEmailModal}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendEmail}
                      disabled={!email || isSendingEmail}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Video
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Zora Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pay with Zora Coins</h3>
                  <Button
                    onClick={closePaymentModal}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 border-0 p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <Coins className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Video Download</h4>
                    <p className="text-gray-600 mb-4">Complete payment with Zora coins to download your generated video</p>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">0.001 ETH</p>
                      <p className="text-sm text-gray-600">Pay with your Zora creator coins</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Connect your wallet</li>
                      <li>• Trade ETH for our creator coins</li>
                      <li>• Download your video instantly</li>
                    </ul>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={closePaymentModal}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleZoraPayment}
                      disabled={isProcessingPayment}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Coins className="h-4 w-4 mr-2" />
                          Pay with Zora
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 