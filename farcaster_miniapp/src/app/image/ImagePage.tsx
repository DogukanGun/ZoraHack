'use client'

import { useState, useRef } from 'react'
import { Button } from '~/components/ui/Button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { ArrowLeft, Upload, Filter, Wand2, Share, Coins } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMiniApp } from '@neynar/react'

export default function ImagePage() {
  const { isSDKLoaded } = useMiniApp()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<'filter' | 'edit' | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const response = await fetch(`http://localhost:8000/image/${filterType}`, {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        setProcessedImage(imageUrl)
      }
    } catch (error) {
      console.error('Filter application failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAIEdit = async () => {
    if (!selectedFile || !prompt) return
    
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('prompt', prompt)
      
      const response = await fetch('http://localhost:8000/image/generate', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        setProcessedImage(imageUrl)
      }
    } catch (error) {
      console.error('AI editing failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShare = () => {
    console.log('Share on Farcaster')
  }

  const handleCreateNFT = () => {
    console.log('Create NFT')
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
          <h1 className="text-3xl font-bold text-white">Create Images</h1>
        </div>

        {!selectedFile ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center p-8">
              <div className="mb-6">
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Upload Image</h2>
                <p className="text-gray-300">Choose an image to get started</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                Select Image
              </Button>
            </CardContent>
          </Card>
        ) : !selectedOption ? (
          <div className="space-y-8">
            <Card className="max-w-md mx-auto">
              <CardContent className="text-center p-6">
                <img 
                  src={imagePreview!} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <Button 
                  onClick={() => setSelectedFile(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white text-sm"
                >
                  Change Image
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card 
                className="cursor-pointer transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-500/20 to-teal-600/20 border-green-500/30"
                onClick={() => setSelectedOption('filter')}
              >
                <CardContent className="text-center p-6">
                  <Filter className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Apply Filters</h3>
                  <p className="text-gray-300">Transform your image with stunning filters</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/30"
                onClick={() => setSelectedOption('edit')}
              >
                <CardContent className="text-center p-6">
                  <Wand2 className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">AI Edit</h3>
                  <p className="text-gray-300">Edit your image with AI prompts</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : selectedOption === 'filter' ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Original</h3>
                  <img 
                    src={imagePreview!} 
                    alt="Original" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Filtered</h3>
                  {processedImage ? (
                    <img 
                      src={processedImage} 
                      alt="Filtered" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">Choose a filter to preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Available Filters</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => handleFilterApply('cartoon_a')}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    {isProcessing ? 'Processing...' : 'Cartoon A'}
                  </Button>
                  <Button 
                    onClick={() => handleFilterApply('cartoon_b')}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-green-500 to-blue-600"
                  >
                    {isProcessing ? 'Processing...' : 'Cartoon B'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {processedImage && (
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={handleShare}
                  className="bg-gradient-to-r from-purple-500 to-pink-600"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share on Farcaster
                </Button>
                <Button 
                  onClick={handleCreateNFT}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Create NFT
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Original</h3>
                  <img 
                    src={imagePreview!} 
                    alt="Original" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">AI Edited</h3>
                  {processedImage ? (
                    <img 
                      src={processedImage} 
                      alt="AI Edited" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">Enter prompt and generate</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">AI Prompt</h3>
                <div className="space-y-4">
                  <Input
                    placeholder="Describe how you want to edit the image..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  />
                  <Button 
                    onClick={handleAIEdit}
                    disabled={isProcessing || !prompt}
                    className="bg-gradient-to-r from-purple-500 to-pink-600"
                  >
                    {isProcessing ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {processedImage && (
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={handleShare}
                  className="bg-gradient-to-r from-purple-500 to-pink-600"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share on Farcaster
                </Button>
                <Button 
                  onClick={handleCreateNFT}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Create NFT
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 