import { useState, useRef, useEffect } from "react";
import { useDesign } from "@/context/design-context";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import { modifyDesign } from "@/lib/openai";

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

interface DesignAssistantProps {
  designId?: number;
}

const DesignAssistant = ({ designId }: DesignAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'I\'ve analyzed your design and detected the color distribution. The design requires the calculated balloons in total, with the estimated clusters. Is there anything you\'d like to adjust?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { activeDesign, setActiveDesign } = useDesign();
  const { toast } = useToast();
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat history when messages change
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendCommand = async () => {
    if (!input.trim() || !designId) return;
    
    const userMessage: Message = {
      sender: 'user',
      text: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      // Call the API to process the command
      const result = await modifyDesign(designId, input);
      
      const aiMessage: Message = {
        sender: 'ai',
        text: `I've processed your request: "${input}". The design has been updated accordingly. Would you like to make any other changes?`
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update the design with modified values from the server
      if (activeDesign && result) {
        const updatedDesign = {
          ...activeDesign, 
          colorAnalysis: result.colorAnalysis,
          materialRequirements: result.materialRequirements,
          totalBalloons: result.totalBalloons,
          estimatedClusters: result.estimatedClusters,
          productionTime: result.productionTime
        };
        setActiveDesign(updatedDesign);
      }
      
    } catch (error) {
      console.error("Error processing command:", error);
      toast({
        title: "Command Processing Failed",
        description: "There was an error processing your command. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        sender: 'ai',
        text: "I'm sorry, I couldn't process that command. Please try again with a different format or wording."
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendCommand();
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-base font-medium text-secondary-800 mb-3">Interactive Design Assistant</h3>
      <div className="bg-white border border-secondary-200 rounded-lg overflow-hidden">
        <div className="p-3 bg-accent-50 border-b border-secondary-200">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-accent-700">Modify your design using natural language commands</p>
          </div>
        </div>
        
        <div ref={chatHistoryRef} className="p-4 h-40 overflow-y-auto border-b border-secondary-200">
          {/* Chat History */}
          <div className="space-y-3">
            {messages.map((message, index) => (
              message.sender === 'ai' ? (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm mr-2">
                    AI
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3 text-sm text-secondary-800 max-w-md">
                    {message.text}
                  </div>
                </div>
              ) : (
                <div key={index} className="flex items-start justify-end">
                  <div className="bg-primary-50 rounded-lg p-3 text-sm text-secondary-800 max-w-md">
                    {message.text}
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-semibold text-sm ml-2">
                    {activeDesign?.userId ? activeDesign.userId.toString().substring(0, 2) : 'U'}
                  </div>
                </div>
              )
            ))}
            
            {isProcessing && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm mr-2">
                  AI
                </div>
                <div className="bg-secondary-50 rounded-lg p-3 text-sm text-secondary-800 max-w-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Command Input */}
        <div className="p-3">
          <div className="relative">
            <input 
              type="text" 
              className="w-full rounded-md border border-secondary-300 pl-3 pr-12 py-2 text-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
              placeholder="Type a command (e.g., 'change blue clusters to 7')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
            />
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700 disabled:opacity-50"
              onClick={handleSendCommand}
              disabled={!input.trim() || isProcessing}
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-secondary-500">Try: "add 2 more yellow clusters", "change white to pink", "recalculate with less blue"</p>
        </div>
      </div>
    </div>
  );
};

export default DesignAssistant;
