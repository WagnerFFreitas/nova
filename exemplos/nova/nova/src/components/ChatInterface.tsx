import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { NovaAvatar } from './NovaAvatar';
import { Send, Settings, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Domain = 'general' | 'theology' | 'tech';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  domain: Domain;
}

interface ChatInterfaceProps {
  selectedDomain: Domain;
}

export const ChatInterface = ({ selectedDomain }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Eu sou NOVA, sua assistente de IA especializada. Como posso ajudá-lo hoje?',
      isUser: false,
      timestamp: new Date(),
      domain: 'general'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
      domain: selectedDomain
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate API call to Ollama
      await simulateOllamaResponse(inputValue, selectedDomain);
    } catch (error) {
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar ao Ollama. Verifique se está rodando em localhost:11434",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateOllamaResponse = async (userInput: string, domain: Domain) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let response = '';
    
    switch (domain) {
      case 'theology':
        response = `Como especialista em Teologia Bíblica, posso ajudar com sua pergunta sobre "${userInput}". Esta área requer análise cuidadosa das Escrituras, considerando o contexto histórico, cultural e linguístico. Você gostaria que eu aprofunde algum aspecto específico?`;
        break;
      case 'tech':
        response = `Analisando sua questão sobre desenvolvimento: "${userInput}". Como especialista em programação, posso sugerir algumas abordagens técnicas e melhores práticas. Que tecnologias ou frameworks você está utilizando?`;
        break;
      default:
        response = `Entendi sua pergunta: "${userInput}". Como posso ajudar você da melhor forma? Se precisar de conhecimento específico em Teologia ou Desenvolvimento, pode trocar para o domínio especializado.`;
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response,
      isUser: false,
      timestamp: new Date(),
      domain
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] bg-card/80 backdrop-blur-sm border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <NovaAvatar 
            size="sm" 
            mood={isLoading ? 'thinking' : 'neutral'} 
            className={cn(
              selectedDomain === 'theology' && 'ring-2 ring-nova-theology/50',
              selectedDomain === 'tech' && 'ring-2 ring-nova-tech/50'
            )}
          />
          <div>
            <h3 className="font-semibold text-foreground">NOVA AI</h3>
            <p className="text-sm text-muted-foreground">
              {selectedDomain === 'theology' && 'Especialista em Teologia Bíblica'}
              {selectedDomain === 'tech' && 'Especialista em Desenvolvimento'}
              {selectedDomain === 'general' && 'Assistente Geral'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-2" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
              domain={message.domain}
            />
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-3 p-4">
              <NovaAvatar size="sm" mood="thinking" />
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-nova rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-nova rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-nova rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm text-muted-foreground">NOVA está pensando...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem para NOVA..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            variant="glow"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Pressione Enter para enviar • Shift+Enter para quebra de linha
        </p>
      </div>
    </Card>
  );
};