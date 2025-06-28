'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '~/components/ui/Button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { ArrowLeft, Upload, MessageSquareText, Share, Coins, X, Maximize2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMiniApp } from '@neynar/react'

export default function ImagePage() {
  const miniApp = useMiniApp()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<'filter' | 'edit' | 'text-to-image' | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showImagePopup, setShowImagePopup] = useState(false)
  const [popupImage, setPopupImage] = useState<string | null>(null)
  const [isDev, setIsDev] = useState(false)
  const [isCreatingToken, setIsCreatingToken] = useState(false)
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [imageLoading, setImageLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const backendUrl = "https://nft.dogukangun.de"

  // Get wallet address when available
  useEffect(() => {
    const getWalletAddress = async () => {
      try {
        if (miniApp.isSDKLoaded) {
          const ethProvider = await miniApp.wallet?.getEthereumProvider();
          if (ethProvider) {
            const accounts = await ethProvider.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setWalletAddress(accounts[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error getting wallet address:', error);
      }
    };
    
    getWalletAddress();
  }, [miniApp.isSDKLoaded, miniApp.wallet]);

  // Check if we're in development mode
  useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development')
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFilterApply = async (filterType: string) => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    setErrorMessage(null)
    setImageLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const response = await fetch(`${backendUrl}/image/${filterType}`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json, image/jpeg, image/png',
        },
        credentials: 'omit' 
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        setProcessedImage(imageUrl)
        
        // Verify the image loads correctly
        const img = new window.Image()
        img.onload = () => {
          setImageLoading(false)
        }
        img.onerror = () => {
          setErrorMessage("Error loading the processed image")
          setImageLoading(false)
        }
        img.src = imageUrl
      } else {
        const errorText = await response.text()
        setErrorMessage(`Error: ${response.status} - ${errorText || response.statusText}`)
        console.error('Server response error:', response.status, errorText)
        setImageLoading(false)
      }
    } catch (error) {
      console.error('Filter application failed:', error)
      setErrorMessage(`Network error: ${error instanceof Error ? error.message : String(error)}`)
      setImageLoading(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAIEdit = async () => {
    if (!selectedFile || !prompt) return
    
    setIsProcessing(true)
    setErrorMessage(null)
    setImageLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('prompt', prompt)
      
      const response = await fetch(`${backendUrl}/image/generate`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json, image/jpeg, image/png',
        },
        credentials: 'omit'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        setProcessedImage(imageUrl)
        
        // Verify the image loads correctly
        const img = new window.Image()
        img.onload = () => {
          setImageLoading(false)
        }
        img.onerror = () => {
          setErrorMessage("Error loading the processed image")
          setImageLoading(false)
        }
        img.src = imageUrl
      } else {
        const errorText = await response.text()
        setErrorMessage(`Error: ${response.status} - ${errorText || response.statusText}`)
        console.error('Server response error:', response.status, errorText)
        setImageLoading(false)
      }
    } catch (error) {
      console.error('AI editing failed:', error)
      setErrorMessage(`Network error: ${error instanceof Error ? error.message : String(error)}`)
      setImageLoading(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextToImage = async () => {
    if (!prompt) return
    
    setIsProcessing(true)
    setErrorMessage(null)
    setImageLoading(true)
    try {
      const response = await fetch(`${backendUrl}/image/generate/text?text=${encodeURIComponent(prompt)}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json, image/jpeg, image/png',
        },
        credentials: 'omit'
      })
      
      if (response.ok) {
        // Get the response as an array buffer to handle binary data properly
        const arrayBuffer = await response.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: 'image/png' })
        const imageUrl = URL.createObjectURL(blob)
        setProcessedImage(imageUrl)
        
        // Verify the image loads correctly
        const img = new window.Image()
        img.onload = () => {
          setImageLoading(false)
        }
        img.onerror = () => {
          setErrorMessage("Error loading the generated image")
          setImageLoading(false)
          console.error("Image failed to load")
        }
        img.src = imageUrl
      } else {
        const errorText = await response.text()
        setErrorMessage(`Error: ${response.status} - ${errorText || response.statusText}`)
        console.error('Server response error:', response.status, errorText)
        setImageLoading(false)
      }
    } catch (error) {
      console.error('Text to image generation failed:', error)
      setErrorMessage(`Network error: ${error instanceof Error ? error.message : String(error)}`)
      setImageLoading(false)
    } finally {
      setIsProcessing(false)
    }
  }

  // Add a function to test the basic API connection - only available in dev mode
  const testApiConnection = async () => {
    if (!isDev) return
    
    setIsProcessing(true)
    setErrorMessage(null)
    try {
      const response = await fetch(backendUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('API connection successful:', data)
        setErrorMessage(`API connection successful: ${JSON.stringify(data)}`)
      } else {
        const errorText = await response.text()
        setErrorMessage(`Error: ${response.status} - ${errorText || response.statusText}`)
        console.error('Server response error:', response.status, errorText)
      }
    } catch (error) {
      console.error('API connection test failed:', error)
      setErrorMessage(`Network error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle sharing on Farcaster
  const handleShareOnFarcaster = async () => {
    if (!processedImage) return
    
    try {
      // Use the Farcaster SDK to compose a cast with the image
      await miniApp.actions.composeCast({
        text: `Check out this image I created with AI! ${prompt ? `Prompt: "${prompt}"` : ''}`,
        embeds: [processedImage], // Using the processed image URL as an embed
      })
    } catch (error) {
      console.error('Error sharing on Farcaster:', error)
      setErrorMessage(`Error sharing: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Function to show image in popup
  const showImageInPopup = (imageUrl: string) => {
    setPopupImage(imageUrl)
    setShowImagePopup(true)
  }

  // Handle creating a meme token
  const handleCreateMemeToken = () => {
    setIsCreatingToken(true)
  }

  // Handle token creation submission
  const handleTokenCreationSubmit = async () => {
    if (!tokenName || !tokenSymbol || !processedImage) {
      setErrorMessage('Please enter both token name and symbol')
      return
    }
    
    setIsProcessing(true)
    setErrorMessage(`Creating token ${tokenName} (${tokenSymbol})...`)
    
    try {
      if (!walletAddress) {
        setErrorMessage('Wallet not connected. Please connect your wallet to create a token.')
        setIsProcessing(false)
        return
      }
      
      // In a real implementation, we would:
      // 1. Upload the image to IPFS first
      // 2. Create metadata JSON with the image IPFS link
      // 3. Use the Zora SDK to create the token
      
      // For now, we'll show a more informative message since we can't fully
      // implement the token creation without proper IPFS integration
      setErrorMessage(`To create a token with Zora, we need to:
      1. Upload your image to IPFS
      2. Create metadata with name: ${tokenName}, symbol: ${tokenSymbol}
      3. Use your connected wallet (${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}) to mint the NFT
      
      This requires additional setup with IPFS and Zora contracts.`)
      
      // Simulate completion after a delay
      setTimeout(() => {
        setIsProcessing(false)
      }, 3000)
    } catch (error) {
      console.error('Error creating token:', error)
      setErrorMessage(`Error creating token: ${error instanceof Error ? error.message : String(error)}`)
      setIsProcessing(false)
    }
  }

  // Function to render an image with loading state
  const renderImage = (src: string, alt: string, onClick?: () => void) => {
    return (
      <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
        {imageLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        ) : null}
        <img 
          src={src} 
          alt={alt} 
          className={`w-full h-full object-cover ${imageLoading ? 'opacity-50' : 'opacity-100'}`}
          onLoad={() => src === processedImage ? setImageLoading(false) : null}
          onError={() => {
            console.error(`Failed to load image: ${src}`)
            setErrorMessage(`Failed to load image: ${alt}`)
          }}
        />
        {onClick && (
          <Button 
            onClick={onClick}
            className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 p-1 rounded-full"
          >
            <Maximize2 className="h-4 w-4 text-white" />
          </Button>
        )}
      </div>
    )
  }

  if (!miniApp.isSDKLoaded) {
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
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-8">
          <Button 
            onClick={() => router.back()}
            className="mr-4 bg-white/10 hover:bg-white/20 text-white border-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-white">Create Images</h1>
        </div>

        {/* Display error message if any */}
        {errorMessage && (
          <Card className={`${errorMessage.includes('Error') ? 'bg-red-500/20 border-red-500/30' : 'bg-green-500/20 border-green-500/30'} mb-4`}>
            <CardContent className="p-4">
              <p className="text-white text-sm">{errorMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* Test API connection button - only in dev mode */}
        {isDev && (
          <Button 
            onClick={testApiConnection}
            disabled={isProcessing}
            className="mb-4 bg-white/20 hover:bg-white/30 text-white w-full"
          >
            {isProcessing ? 'Testing...' : 'Test API Connection'}
          </Button>
        )}

        {!selectedFile && selectedOption !== 'text-to-image' ? (
          <Card className="bg-white/10 border-white/5">
            <CardContent className="text-center p-8">
              <div className="mb-6">
                <Upload className="h-16 w-16 text-white/60 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Upload Image or Create from Text</h2>
                <p className="text-white/70">Choose an option to get started</p>
              </div>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 w-full"
                >
                  Select Image
                </Button>
                <Button 
                  onClick={() => setSelectedOption('text-to-image')}
                  className="bg-blue-600 w-full"
                >
                  Create from Text
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : !selectedOption ? (
          <div className="space-y-8">
            <Card className="bg-white/10 border-white/5">
              <CardContent className="text-center p-6">
                <div className="relative">
                  {renderImage(imagePreview!, "Preview", () => showImageInPopup(imagePreview!))}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button 
                    onClick={() => setSelectedOption('filter')}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    Apply Filters
                  </Button>
                  <Button 
                    onClick={() => setSelectedOption('edit')}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    AI Edit
                  </Button>
                </div>
                <Button 
                  onClick={() => setSelectedFile(null)}
                  className="mt-4 bg-white/10 hover:bg-white/20 text-white text-sm w-full"
                >
                  Change Image
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : selectedOption === 'filter' ? (
          <div className="space-y-6">
            <Card className="bg-white/10 border-white/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Original</h3>
                <div className="relative">
                  {renderImage(imagePreview!, "Original", () => showImageInPopup(imagePreview!))}
                </div>
                <h3 className="text-lg font-semibold text-white mb-4 mt-6">Available Filters</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => handleFilterApply('cartoon_a')}
                    disabled={isProcessing}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    {isProcessing ? 'Processing...' : 'Cartoon A'}
                  </Button>
                  <Button 
                    onClick={() => handleFilterApply('cartoon_b')}
                    disabled={isProcessing}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    {isProcessing ? 'Processing...' : 'Cartoon B'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {processedImage && (
              <Card className="bg-white/10 border-white/5">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Filtered Result</h3>
                  <div className="relative">
                    {renderImage(processedImage, "Filtered", () => showImageInPopup(processedImage))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Button 
                      onClick={handleShareOnFarcaster}
                      disabled={isProcessing}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      onClick={handleCreateMemeToken}
                      disabled={isProcessing}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Create Token
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : selectedOption === 'edit' ? (
          <div className="space-y-6">
            <Card className="bg-white/10 border-white/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Original</h3>
                <div className="relative">
                  {renderImage(imagePreview!, "Original", () => showImageInPopup(imagePreview!))}
                </div>
                <h3 className="text-lg font-semibold text-white mb-4 mt-6">AI Prompt</h3>
                <Input
                  placeholder="Describe how you want to edit the image..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/50 mb-4"
                />
                <Button 
                  onClick={handleAIEdit}
                  disabled={isProcessing || !prompt}
                  className="bg-white/20 hover:bg-white/30 text-white w-full"
                >
                  {isProcessing ? 'Generating...' : 'Generate'}
                </Button>
              </CardContent>
            </Card>

            {processedImage && (
              <Card className="bg-white/10 border-white/5">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">AI Edited Result</h3>
                  <div className="relative">
                    {renderImage(processedImage, "AI Edited", () => showImageInPopup(processedImage))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Button 
                      onClick={handleShareOnFarcaster}
                      disabled={isProcessing}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      onClick={handleCreateMemeToken}
                      disabled={isProcessing}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Create Token
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-white/10 border-white/5">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <MessageSquareText className="h-16 w-16 text-white/60 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-white mb-2">Text to Image</h2>
                  <p className="text-white/70">Generate an image from your text description</p>
                </div>
                <Input
                  placeholder="Describe the image you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/50 mb-4"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => {
                      setSelectedOption(null)
                      setSelectedFile(null)
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white"
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleTextToImage}
                    disabled={isProcessing || !prompt}
                    className="bg-blue-600"
                  >
                    {isProcessing ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {processedImage && (
              <Card className="bg-white/10 border-white/5">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Generated Image</h3>
                  <div className="relative">
                    {renderImage(processedImage, "Generated", () => showImageInPopup(processedImage))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Button 
                      onClick={handleShareOnFarcaster}
                      disabled={isProcessing}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      onClick={handleCreateMemeToken}
                      disabled={isProcessing}
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Create Token
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Image Popup */}
        {showImagePopup && popupImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full">
              <Button 
                onClick={() => setShowImagePopup(false)}
                className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 p-2 rounded-full z-10"
              >
                <X className="h-6 w-6 text-white" />
              </Button>
              <img 
                src={popupImage} 
                alt="Full Size" 
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                onError={() => {
                  setErrorMessage("Failed to load image in popup view")
                  setShowImagePopup(false)
                }}
              />
            </div>
          </div>
        )}

        {/* Token Creation Modal */}
        {isCreatingToken && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="bg-white/10 border-white/5 w-full max-w-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Create Meme Token</h3>
                  <Button 
                    onClick={() => setIsCreatingToken(false)}
                    className="bg-transparent hover:bg-white/10 p-1 rounded-full"
                    disabled={isProcessing}
                  >
                    <X className="h-5 w-5 text-white" />
                  </Button>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Token Name</label>
                    <Input
                      placeholder="My Awesome Token"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-sm mb-1">Token Symbol</label>
                    <Input
                      placeholder="MAT"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleTokenCreationSubmit}
                  disabled={!tokenName || !tokenSymbol || isProcessing}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 w-full"
                >
                  {isProcessing ? 'Creating...' : 'Create Token'}
                </Button>
                
                <p className="text-white/50 text-xs mt-4 text-center">
                  Token will be created on Base using the Zora protocol
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 