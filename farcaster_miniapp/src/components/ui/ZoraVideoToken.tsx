import { useState } from 'react';
import { Button } from './Button';
import { Card, CardContent } from './card';
import { Loader2, Coins } from 'lucide-react';
import { Address, parseEther } from "viem";

interface ZoraVideoTokenProps {
  prompt: string;
  videoUrl: string;
}

export function ZoraVideoToken({ prompt, videoUrl }: ZoraVideoTokenProps) {
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateToken = async () => {
    setIsCreatingToken(true);
    setError(null);
    
    try {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_token',
          prompt,
          videoUrl,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create token');
      }

      setTokenAddress(data.tokenAddress);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create token');
      console.error('Error creating token:', error);
    } finally {
      setIsCreatingToken(false);
    }
  };

  const handleBuyVideo = async () => {
    if (!tokenAddress) return;
    
    setIsTrading(true);
    setError(null);

    try {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'buy_token',
          tokenAddress: tokenAddress as Address,
          amount: parseEther("0.01"), // 0.01 ETH
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to purchase token');
      }

      // Download video after successful purchase
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `video_${prompt.substring(0, 30)}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to purchase video');
      console.error('Error purchasing video:', error);
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Purchase Video</h3>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-white text-sm">{error}</p>
          </div>
        )}

        {!tokenAddress ? (
          <Button
            onClick={handleCreateToken}
            disabled={isCreatingToken}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {isCreatingToken ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Token...
              </>
            ) : (
              <>
                <Coins className="h-4 w-4 mr-2" />
                Create Video Token
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleBuyVideo}
            disabled={isTrading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            {isTrading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Purchase...
              </>
            ) : (
              <>
                <Coins className="h-4 w-4 mr-2" />
                Buy & Download Video (0.01 ETH)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 