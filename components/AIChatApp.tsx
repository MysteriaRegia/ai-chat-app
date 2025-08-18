"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Settings, LogOut, Menu, X, Sparkles } from 'lucide-react';

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
  email: 'seeker@hierophant.ai',
  name: 'Seeker'
};

const mockConversations: Conversation[] = [
  { id: '1', title: 'New Inquiry', messages: [] },
];

interface AIMessageProps {
  message: Message;
  isStreaming?: boolean;
}

const AIMessage: React.FC<AIMessageProps> = ({ message, isStreaming }) => (
  <div className="flex gap-4 p-6 hover:bg-gray-800/30 transition-all duration-300">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
        <Sparkles size={18} className="text-white" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-100 leading-relaxed whitespace-pre-wrap font-medium">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-3 h-5 bg-gradient-to-r from-purple-400 to-cyan-400 ml-2 animate-pulse rounded-sm" />
          )}
        </p>
      </div>
    </div>
  </div>
);

interface UserMessageProps {
  message: Message;
}

const UserMessage: React.FC<UserMessageProps> = ({ message }) => (
  <div className="flex gap-4 p-6 bg-gray-800/20 border-l-2 border-cyan-500/30">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow-lg">
        <User size={18} className="text-gray-200" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
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
  <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-950/95 backdrop-blur-xl border-r border-gray-800/50 text-white transform transition-all duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Hierophant AI
          </h2>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-800/50 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <button 
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
          >
            New Inquiry
          </button>
        </div>
        
        <div className="px-3">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full text-left p-4 rounded-xl mb-2 transition-all duration-200 font-medium ${
                activeConversation?.id === conv.id 
                  ? 'bg-gradient-to-r from-purple-600/20 to-violet-600/20 border border-purple-500/30 text-purple-200' 
                  : 'hover:bg-gray-800/40 text-gray-300 hover:text-white'
              }`}
            >
              {conv.title}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-800/50 bg-gray-900/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
            <User size={18} className="text-gray-200" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">{mockUser.name}</p>
            <p className="text-xs text-gray-400 truncate">{mockUser.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors">
            <Settings size={16} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button className="flex items-center justify-center px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors">
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
  <div className="px-6 py-4 border-b border-gray-800/30 bg-gray-900/20">
    <select 
      value={selectedModel} 
      onChange={(e) => onModelChange(e.target.value)}
      className="w-full max-w-xs px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all font-medium"
    >
      <option value="gpt-4o" className="bg-gray-800">GPT-4o (OpenAI)</option>
      <option value="gpt-4o-mini" className="bg-gray-800">GPT-4o Mini (OpenAI)</option>
      <option value="claude-3-5-sonnet-20241022" className="bg-gray-800">Claude 3.5 Sonnet</option>
      <option value="claude-3-5-haiku-20241022" className="bg-gray-800">Claude 3.5 Haiku</option>
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
        content: 'I apologize, but I encountered an error processing your inquiry. Please try again.',
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
      title: 'New Inquiry',
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
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-6 border-b border-gray-800/30 bg-gray-900/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <Menu size={20} className="text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-100">
              {activeConversation?.title || 'New Inquiry'}
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
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-purple-500/25">
                  <Sparkles size={32} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-100 mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Welcome to Hierophant AI
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Your guide to the sacred mysteries of knowledge. 
                  <br />
                  What wisdom do you seek today?
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
                    content: 'Consulting the archives...',
                    timestamp: new Date().toISOString()
                  }} 
                  isStreaming={true}
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-gray-800/30 p-6 bg-gray-900/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask the Hierophant anything..."
                  className="w-full px-5 py-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-gray-100 placeholder-gray-400 font-medium backdrop-blur-sm"
                  rows={1}
                  style={{ minHeight: '56px', maxHeight: '160px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!message.trim() || isLoading}
                className="px-5 py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:shadow-none"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center font-medium">
              Hierophant AI reveals knowledge but may contain mysteries. Verify important revelations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatApp;