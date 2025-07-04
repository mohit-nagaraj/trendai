"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  contentTypes: string[];
  color: string;
}

const platforms: Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    description: 'Visual storytelling, carousel posts, professional aesthetics',
    contentTypes: ['Post', 'Carousel', 'Story', 'Reel'],
    color: 'bg-pink-100 text-pink-700 border-pink-200'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    description: 'Short-form video, trending audio, quick tips',
    contentTypes: ['Video', 'Trending'],
    color: 'bg-gray-100 text-gray-700 border-gray-200'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    description: 'Professional insights, career advice, industry analysis',
    contentTypes: ['Post', 'Article', 'Newsletter'],
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '🎥',
    description: 'Educational content, detailed tutorials, case studies',
    contentTypes: ['Video', 'Short', 'Live'],
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '🐦',
    description: 'Quick insights, thread-worthy content, news commentary',
    contentTypes: ['Tweet', 'Thread', 'Space'],
    color: 'bg-sky-100 text-sky-700 border-sky-200'
  }
];

interface PlatformSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (selectedPlatforms: string[]) => void;
  loading?: boolean;
}

export function PlatformSelectionDialog({ 
  open, 
  onOpenChange, 
  onGenerate, 
  loading = false 
}: PlatformSelectionDialogProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerate = () => {
    if (selectedPlatforms.length > 0) {
      onGenerate(selectedPlatforms);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Platforms</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {platforms.map(platform => (
            <div key={platform.id} className="flex items-center gap-4 p-2 rounded border cursor-pointer hover:bg-muted" onClick={() => handlePlatformToggle(platform.id)}>
              <Checkbox checked={selectedPlatforms.includes(platform.id)} onCheckedChange={() => handlePlatformToggle(platform.id)} />
              <span className={`w-8 h-8 flex items-center justify-center rounded-full border ${platform.color}`}>{platform.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{platform.name}</div>
                <div className="text-xs text-muted-foreground">{platform.description}</div>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {platform.contentTypes.map(type => (
                    <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <DialogFooter>
          <Button onClick={handleGenerate} className='cursor-pointer' disabled={selectedPlatforms.length === 0 || loading}>
            {loading ? 'Generating...' : 'Generate Ideas'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 