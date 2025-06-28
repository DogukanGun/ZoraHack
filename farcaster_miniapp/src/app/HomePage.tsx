'use client'

import { Button } from '~/components/ui/Button'
import { Card, CardContent } from '~/components/ui/card'
import { ImageIcon, VideoIcon, Sparkles, Wand2 } from 'lucide-react'
import { useMiniApp } from '@neynar/react'

export default function HomePage() {
  const { isSDKLoaded } = useMiniApp()

  const handleOptionSelect = (option: 'image' | 'video') => {
    if (option === 'image') {
      window.location.href = '/image'
    } else {
      window.location.href = '/video'
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
        <div className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-yellow-400 mr-2" />
            <h1 className="text-4xl font-bold text-white">CreativeStudio</h1>
            <Sparkles className="h-8 w-8 text-yellow-400 ml-2" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform your ideas into stunning visuals with AI-powered creativity
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border-pink-500/30 backdrop-blur-sm"
            onClick={() => handleOptionSelect('image')}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Create Images</h2>
              <p className="text-gray-300 mb-6">
                Apply stunning filters or edit images with AI prompts
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center justify-center">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Apply Filters
                </div>
                <div className="flex items-center justify-center">
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Image Editing
                </div>
              </div>
              <Button className="mt-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 w-full">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-blue-500/30 backdrop-blur-sm"
            onClick={() => handleOptionSelect('video')}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <VideoIcon className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Create Videos</h2>
              <p className="text-gray-300 mb-6">
                Generate amazing videos from text prompts using AI
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center justify-center">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Text to Video
                </div>
                <div className="flex items-center justify-center">
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Generation
                </div>
              </div>
              <Button className="mt-6 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 w-full">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            Powered by AI • Share on Farcaster • Create NFTs
          </p>
        </div>
      </div>
    </div>
  )
} 