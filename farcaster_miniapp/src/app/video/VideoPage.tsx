'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/Button'
import { Card, CardContent } from '~/components/ui/card'
import { ArrowLeft, Video, Wand2, Share } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMiniApp } from '@neynar/react'

export default function VideoPage() {
  const { isSDKLoaded } = useMiniApp()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const router = useRouter()

  const handleGenerateVideo = async () => {
    if (!prompt) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('http://localhost:8000/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const videoUrl = URL.createObjectURL(blob)
        setGeneratedVideo(videoUrl)
      }
    } catch (error) {
      console.error('Video generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = () => {
    console.log('Share on Farcaster')
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
                  <video 
                    src={generatedVideo} 
                    controls 
                    className="w-full rounded-lg"
                    style={{ maxHeight: '400px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button 
                  onClick={handleShare}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share on Farcaster
                </Button>
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
      </div>
    </div>
  )
} 