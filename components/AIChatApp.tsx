import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Settings, LogOut, Menu, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

const mockUser = {
  id: '1',
  email: 'user@example.com',
  name: 'User'
};

const mockConversations: Conversation[] = [
  { id: '1', title: 'New Chat', messages: [] },
];

interface AIMessageProps {
  message: Message;
  isStreaming?: boolean;
}

const AIMessage: React.FC<AIMessageProps> = ({ message, isStreaming }) => (
  <div className="flex gap-3 p-4 hover:bg-gray-50">
    <div className="flex-shrink-0">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
        <Bot size={16} className="text-white" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="prose max-w-none">
        <p className="text-gray-900 whitespace-pre-wrap">
          {message.content}
          {isStreaming && <span className="inline-block w-2 h-5 bg-gray-400 ml-1 animate-pulse" />}
        </p>
      </div>
    </div>
  </div>
);

interface UserMessageProps {
  message: Message;
}

const UserMessage: React.FC<UserMessageProps> = ({ message }) => (
  <div className="flex gap-3 p-4 bg-gray-50">
    <div className="flex-shrink-0">
      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
        <User size={16} className="text-white" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
    </div>
  </div>
);

interface SidebarProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  onNewChat, 
  isOpen, 
  onClose 
}) => (
  <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">AI Chat</h2>
        <button onClick={onClose} className="lg:hidden">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <button 
            onClick={onNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            New Chat
          </button>
        </div>
        
        <div className="px-2">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors truncate ${
                activeConversation?.id === conv.id ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              {conv.title}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            <User size={16} />
          </div>
          <span className="text-sm truncate">{mockUser.email}</span>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
            <Settings size={16} />
            <span className="text-sm">Settings</span>
          </button>
          <button className="flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => (
  <div className="px-4 py-2 border-b border-gray-200">
    <select 
      value={selectedModel} 
      onChange={(e) => onModelChange(e.target.value)}
      className="w-full max-w-xs px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="gpt-4o">GPT-4o (OpenAI)</option>
      <option value="gpt-4o-mini">GPT-4o Mini (OpenAI)</option>
      <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
      <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
    </select>
  </div>
);

const AIChatApp: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(mockConversations[0]);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const sendMessage = async (): Promise<void> => {
    if (!message.trim() || isLoading || !activeConversation) return;

    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedConversation: Conversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, userMessage]
    };
    setActiveConversation(updatedConversation);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedConversation.messages,
          model: selectedModel
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        model: selectedModel
      };

      const finalConversation: Conversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, aiMessage],
        title: updatedConversation.messages.length === 1 ? 
          message.slice(0, 30) + '...' : updatedConversation.title
      };

      setActiveConversation(finalConversation);
      
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id ? finalConversation : conv
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setActiveConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage]
      } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createNewChat = (): void => {
    const newChat: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: []
    };
    setConversations([newChat, ...conversations]);
    setActiveConversation(newChat);
    setSidebarOpen(false);
  };

  const selectConversation = (id: string): void => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setActiveConversation(conversation);
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar 
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={selectConversation}
        onNewChat={createNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {activeConversation?.title || 'New Chat'}
            </h1>
          </div>
        </header>

        <ModelSelector 
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />

        <div className="flex-1 overflow-y-auto">
          {activeConversation?.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  How can I help you today?
                </h2>
                <p className="text-gray-600">
                  Start a conversation with your AI assistant
                </p>
              </div>
            </div>
          ) : (
            <div>
              {activeConversation?.messages.map((msg) => (
                msg.role === 'user' ? (
                  <UserMessage key={msg.id} message={msg} />
                ) : (
                  <AIMessage key={msg.id} message={msg} />
                )
              ))}
              {isLoading && (
                <AIMessage 
                  message={{ 
                    id: 'loading',
                    role: 'assistant',
                    content: 'Thinking...',
                    timestamp: new Date().toISOString()
                  }} 
                  isStreaming={true}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!message.trim() || isLoading}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatApp;
