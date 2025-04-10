import { useState } from "react";
import { Send, Bot } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DesignAssistantProps {
  designId?: number;
}

const DesignAssistant = ({ designId }: DesignAssistantProps) => {
  const [command, setCommand] = useState("");
  const [processing, setProcessing] = useState(false);
  const [assistantConversation, setAssistantConversation] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hi! I can help you modify or optimize this balloon design. What would you like to change?' }
  ]);
  const { toast } = useToast();

  const handleSubmitCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!designId) {
      toast({
        title: "Design not selected",
        description: "Please save the design first before using the assistant.",
        variant: "destructive",
      });
      return;
    }
    
    if (!command.trim()) return;
    
    try {
      setProcessing(true);
      
      // Add user message to conversation
      setAssistantConversation(prev => [...prev, { role: 'user', content: command }]);
      
      // Call API to modify the design
      const response = await apiRequest(
        "POST",
        `/api/designs/${designId}/modify`,
        { command }
      );
      
      if (!response.ok) {
        throw new Error("Failed to process design command");
      }
      
      const result = await response.json();
      
      // Add assistant response to conversation
      setAssistantConversation(prev => [...prev, { role: 'assistant', content: result.message || "I've updated the design based on your instructions." }]);
      
      // Clear input
      setCommand("");
      
    } catch (error) {
      console.error("Design assistant error:", error);
      setAssistantConversation(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I had trouble processing that request. Please try again with different instructions." 
      }]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-base font-medium text-secondary-800 mb-3">Design Assistant</h3>
      
      <div className="bg-white border border-secondary-200 rounded-lg overflow-hidden">
        {/* Chat conversation */}
        <div className="max-h-60 overflow-y-auto p-4">
          {assistantConversation.map((message, idx) => (
            <div 
              key={idx} 
              className={`mb-3 ${message.role === 'assistant' ? 'text-left' : 'text-right'}`}
            >
              <div 
                className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === 'assistant' 
                    ? 'bg-secondary-100 text-secondary-800' 
                    : 'bg-primary-600 text-white'
                }`}
              >
                {message.role === 'assistant' && (
                  <Bot className="h-4 w-4 inline-block mr-2 -mt-1" />
                )}
                {message.content}
              </div>
            </div>
          ))}
        </div>
        
        {/* Input area */}
        <div className="border-t border-secondary-200 p-2">
          <form onSubmit={handleSubmitCommand} className="flex">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="flex-1 p-2 border border-secondary-300 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Type your instructions here (e.g., 'Add more red balloons' or 'Make it more festive')"
              disabled={processing || !designId}
            />
            <button
              type="submit"
              className="ml-2 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition disabled:opacity-50"
              disabled={processing || !command.trim() || !designId}
            >
              {processing ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DesignAssistant;