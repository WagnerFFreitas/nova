import { cn } from '@/lib/utils';
import { NovaAvatar } from './NovaAvatar';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
  domain?: 'theology' | 'tech' | 'general';
}

export const ChatMessage = ({ content, isUser, timestamp, domain = 'general' }: ChatMessageProps) => {
  return (
    <div className={cn(
      'flex gap-4 p-4 rounded-lg transition-all duration-300',
      isUser ? 'flex-row-reverse bg-secondary/30' : 'bg-card/50 backdrop-blur-sm'
    )}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-10 h-10 rounded-full bg-nova flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        ) : (
          <NovaAvatar 
            size="sm" 
            mood="speaking"
            className={cn(
              domain === 'theology' && 'ring-2 ring-nova-theology/50',
              domain === 'tech' && 'ring-2 ring-nova-tech/50'
            )}
          />
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          'flex items-center gap-2 mb-1',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-sm font-medium text-foreground">
            {isUser ? 'Você' : 'NOVA'}
          </span>
          {!isUser && domain !== 'general' && (
            <span className={cn(
              'text-xs px-2 py-1 rounded-full font-medium',
              domain === 'theology' && 'bg-nova-theology/20 text-nova-theology',
              domain === 'tech' && 'bg-nova-tech/20 text-nova-tech'
            )}>
              {domain === 'theology' ? 'Teologia' : 'Desenvolvimento'}
            </span>
          )}
          {timestamp && (
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          )}
        </div>
        
        <div className={cn(
          'prose prose-sm max-w-none',
          'text-foreground leading-relaxed',
          isUser ? 'text-right' : 'text-left'
        )}>
          {content}
        </div>
      </div>
    </div>
  );
};