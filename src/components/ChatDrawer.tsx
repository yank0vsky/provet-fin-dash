import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  context: {
    type: 'dashboard' | 'revenue-trend' | 'ar-aging' | 'claims-pipeline';
    title: string;
  } | null;
}

const conversationStarters = {
  dashboard: [
    "What's my DSO trend over the last month?",
    "Which clients owe the most?",
    "How does today's revenue compare to last week?",
  ],
  'revenue-trend': [
    "What was the biggest bill today?",
    "What time of day had the highest revenue?",
    "Compare today's revenue to yesterday",
  ],
  'ar-aging': [
    "Which bucket has grown the most?",
    "Who are my top 5 overdue clients?",
    "What's the total amount over 90 days?",
  ],
  'claims-pipeline': [
    "How many claims are stuck in 'Waiting'?",
    "What's our rejection rate this month?",
    "Which insurer has the most pending claims?",
  ],
};

export function ChatDrawer({ open, onClose, context }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Mock response
    setMessages([
      ...messages,
      { role: 'user', content: input },
      { role: 'assistant', content: 'This is a mock response. In production, this would query your data and provide insights.' }
    ]);
    setInput('');
  };

  const handleStarterClick = (starter: string) => {
    setInput(starter);
  };

  const starters = context ? conversationStarters[context.type] : [];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat with your data
          </SheetTitle>
        </SheetHeader>

        {context && (
          <div className="mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Chatting about: <span className="font-medium text-foreground">{context.title}</span>
            </div>

            {messages.length === 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-sm font-medium">Conversation starters:</p>
                {starters.map((starter, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4"
                    onClick={() => handleStarterClick(starter)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{starter}</span>
                  </Button>
                ))}
              </div>
            )}

            <ScrollArea className="h-[400px] mb-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
