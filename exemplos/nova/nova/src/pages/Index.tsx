import { useState } from 'react';
import { NovaAvatar } from '@/components/NovaAvatar';
import { DomainSelector } from '@/components/DomainSelector';
import { ChatInterface } from '@/components/ChatInterface';
import { OllamaStatus } from '@/components/OllamaStatus';
import { Card } from '@/components/ui/card';
import { Sparkles, Cpu, Database } from 'lucide-react';

type Domain = 'general' | 'theology' | 'tech';

const Index = () => {
  const [selectedDomain, setSelectedDomain] = useState<Domain>('general');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-nova/5 via-transparent to-nova-secondary/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--nova-primary)/0.1),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-8 p-6 bg-card/80 backdrop-blur-sm border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <NovaAvatar size="lg" mood="happy" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-nova via-nova-secondary to-nova-tech bg-clip-text text-transparent">
                  NOVA AI
                </h1>
                <p className="text-lg text-muted-foreground">
                  Assistente Especialista Local
                </p>
                <p className="text-sm text-muted-foreground">
                  Teologia Bíblica • Desenvolvimento de Software
                </p>
              </div>
            </div>
            
            {/* Status indicators */}
            <div className="flex flex-col gap-2">
              <OllamaStatus />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  <span>Local AI</span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>Offline Ready</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Especialista</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-nova-theology/10 border border-nova-theology/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-nova-theology to-yellow-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Teologia Bíblica</h3>
                <p className="text-xs text-muted-foreground">Hermenêutica, exegese e doutrina</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-nova-tech/10 border border-nova-tech/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-nova-tech to-blue-600 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Desenvolvimento</h3>
                <p className="text-xs text-muted-foreground">Programação e arquitetura</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-nova/10 border border-nova/20">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-nova to-nova-secondary flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Processamento Local</h3>
                <p className="text-xs text-muted-foreground">Privacidade e offline</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Domain Selection */}
        <DomainSelector 
          selectedDomain={selectedDomain}
          onDomainChange={setSelectedDomain}
        />

        {/* Chat Interface */}
        <ChatInterface selectedDomain={selectedDomain} />
      </div>
    </div>
  );
};

export default Index;
