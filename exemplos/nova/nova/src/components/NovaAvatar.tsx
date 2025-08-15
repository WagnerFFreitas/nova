import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import novaAvatar from '@/assets/nova-avatar.png';

type AvatarMood = 'neutral' | 'thinking' | 'speaking' | 'happy' | 'focused';

interface NovaAvatarProps {
  mood?: AvatarMood;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NovaAvatar = ({ mood = 'neutral', size = 'md', className }: NovaAvatarProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (mood === 'thinking' || mood === 'speaking') {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [mood]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const getMoodEffects = () => {
    switch (mood) {
      case 'thinking':
        return 'animate-pulse-slow';
      case 'speaking':
        return 'animate-glow';
      case 'happy':
        return 'scale-110';
      case 'focused':
        return 'brightness-110';
      default:
        return '';
    }
  };

  return (
    <div className={cn(
      'relative flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      {/* Outer glow effect */}
      <div className={cn(
        'absolute inset-0 rounded-full',
        'bg-gradient-to-r from-nova via-nova-secondary to-nova-tech',
        'opacity-30 blur-md animate-float',
        isAnimating && 'animate-glow'
      )} />
      
      {/* Avatar container */}
      <div className={cn(
        'relative rounded-full overflow-hidden border-2 border-nova/50',
        'bg-gradient-to-br from-card to-card/80 backdrop-blur-sm',
        'transition-all duration-500 ease-out',
        getMoodEffects()
      )}>
        <img 
          src={novaAvatar} 
          alt="NOVA AI Assistant" 
          className="w-full h-full object-cover"
        />
        
        {/* Overlay effects */}
        <div className={cn(
          'absolute inset-0',
          'bg-gradient-to-br from-nova/20 via-transparent to-nova-secondary/20',
          'transition-opacity duration-300',
          mood === 'thinking' && 'opacity-60',
          mood === 'speaking' && 'opacity-40'
        )} />
      </div>

      {/* Status indicator */}
      {mood !== 'neutral' && (
        <div className={cn(
          'absolute -bottom-1 -right-1 w-4 h-4 rounded-full',
          'border-2 border-background',
          mood === 'thinking' && 'bg-nova-theology animate-pulse',
          mood === 'speaking' && 'bg-nova animate-pulse-slow',
          mood === 'happy' && 'bg-green-500',
          mood === 'focused' && 'bg-nova-tech'
        )} />
      )}
    </div>
  );
};