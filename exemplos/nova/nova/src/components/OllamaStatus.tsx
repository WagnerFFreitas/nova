import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Activity, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OllamaStatusProps {
  className?: string;
}

export const OllamaStatus = ({ className }: OllamaStatusProps) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [model, setModel] = useState<string>('');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkOllamaStatus = async () => {
    setStatus('checking');
    
    try {
      // Simulate checking Ollama status
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate different statuses for demo
      const isConnected = Math.random() > 0.3;
      
      if (isConnected) {
        setStatus('connected');
        setModel('llama3:8b'); // Simulated model
      } else {
        setStatus('disconnected');
        setModel('');
      }
    } catch (error) {
      setStatus('disconnected');
      setModel('');
    }
    
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkOllamaStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkOllamaStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'bg-green-500',
          text: 'Conectado',
          description: `Modelo: ${model}`
        };
      case 'disconnected':
        return {
          icon: AlertCircle,
          color: 'bg-red-500',
          text: 'Desconectado',
          description: 'Verifique se o Ollama está rodando'
        };
      default:
        return {
          icon: Activity,
          color: 'bg-yellow-500',
          text: 'Verificando...',
          description: 'Conectando ao Ollama'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card className={cn(
      'p-4 bg-card/50 backdrop-blur-sm border-border/50',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              'w-3 h-3 rounded-full',
              config.color,
              status === 'checking' && 'animate-pulse'
            )} />
            {status === 'connected' && (
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-30" />
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-foreground" />
              <span className="font-medium text-foreground">Ollama</span>
              <Badge variant={status === 'connected' ? 'default' : 'destructive'} className="text-xs">
                {config.text}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {lastCheck.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={checkOllamaStatus}
            className="w-8 h-8"
          >
            <RefreshCw className={cn(
              'w-3 h-3',
              status === 'checking' && 'animate-spin'
            )} />
          </Button>
        </div>
      </div>

      {status === 'disconnected' && (
        <div className="mt-3 p-3 bg-destructive/10 rounded-md border border-destructive/20">
          <p className="text-xs text-destructive">
            Para usar NOVA, certifique-se de que o Ollama está rodando em{' '}
            <code className="bg-destructive/20 px-1 rounded">http://localhost:11434</code>
          </p>
        </div>
      )}
    </Card>
  );
};