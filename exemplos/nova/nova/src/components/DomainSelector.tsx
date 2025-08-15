import { Button } from './ui/button';
import { Card } from './ui/card';
import { BookOpen, Code, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Domain = 'general' | 'theology' | 'tech';

interface DomainSelectorProps {
  selectedDomain: Domain;
  onDomainChange: (domain: Domain) => void;
}

export const DomainSelector = ({ selectedDomain, onDomainChange }: DomainSelectorProps) => {
  const domains = [
    {
      id: 'general' as Domain,
      name: 'Geral',
      icon: Sparkles,
      description: 'Conversas gerais com NOVA',
      variant: 'nova' as const
    },
    {
      id: 'theology' as Domain,
      name: 'Teologia Bíblica',
      icon: BookOpen,
      description: 'Especialista em teologia, hermenêutica e exegese',
      variant: 'theology' as const
    },
    {
      id: 'tech' as Domain,
      name: 'Desenvolvimento',
      icon: Code,
      description: 'Programação, frameworks e arquitetura de software',
      variant: 'tech' as const
    }
  ];

  return (
    <Card className="p-6 mb-6 bg-card/80 backdrop-blur-sm border-border/50">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Escolha o Domínio de Especialização</h3>
        <p className="text-sm text-muted-foreground">Selecione a área onde NOVA deve focar suas respostas</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {domains.map((domain) => {
          const Icon = domain.icon;
          const isSelected = selectedDomain === domain.id;
          
          return (
            <Card 
              key={domain.id}
              className={cn(
                'p-4 cursor-pointer transition-all duration-300 hover:scale-105',
                'border-2 bg-card/50 backdrop-blur-sm',
                isSelected ? 'border-nova ring-2 ring-nova/20' : 'border-border/50 hover:border-nova/50'
              )}
              onClick={() => onDomainChange(domain.id)}
            >
              <div className="text-center space-y-3">
                <div className={cn(
                  'w-12 h-12 mx-auto rounded-full flex items-center justify-center',
                  'bg-gradient-to-br transition-all duration-300',
                  isSelected && domain.id === 'theology' && 'from-nova-theology to-yellow-500',
                  isSelected && domain.id === 'tech' && 'from-nova-tech to-blue-600',
                  isSelected && domain.id === 'general' && 'from-nova to-nova-secondary',
                  !isSelected && 'from-muted to-muted/80'
                )}>
                  <Icon className={cn(
                    'w-6 h-6',
                    isSelected ? 'text-white' : 'text-muted-foreground'
                  )} />
                </div>
                
                <div>
                  <h4 className={cn(
                    'font-medium mb-1 transition-colors',
                    isSelected ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {domain.name}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                {isSelected && (
                  <Button 
                    variant={domain.variant} 
                    size="sm" 
                    className="w-full"
                  >
                    Selecionado
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};