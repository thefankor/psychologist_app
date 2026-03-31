import { useState, useRef, useEffect } from 'react';
import { Send, Search, Circle, Phone, Video, MoreVertical } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { mockChats, mockMessages } from '../data/mockData';

export default function Chats() {
  const [chats] = useState(mockChats);
  const [messages, setMessages] = useState(mockMessages);
  const [selectedChatId, setSelectedChatId] = useState<string | null>('chat1');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChatId, messages]);

  const selectedChat = chats.find((c) => c.id === selectedChatId);
  const chatMessages = messages.filter((m) => m.chatId === selectedChatId);

  const filteredChats = chats.filter((chat) =>
    chat.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatId) return;

    const message = {
      id: `m${messages.length + 1}`,
      chatId: selectedChatId,
      senderId: 'therapist',
      senderName: 'Др. Смирнов',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text' as const,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Вчера';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chats List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Сообщения</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск клиентов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedChatId === chat.id
                    ? 'bg-blue-50 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                      {chat.clientName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    {chat.isOnline && (
                      <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {chat.clientName}
                      </h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                      {chat.unreadCount > 0 && (
                        <Badge className="ml-2 bg-blue-600 text-white rounded-full h-5 min-w-5 flex items-center justify-center text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                    {selectedChat.clientName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  {selectedChat.isOnline && (
                    <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedChat.clientName}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedChat.isOnline ? 'В сети' : 'Не в сети'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4 max-w-4xl mx-auto">
                {chatMessages.map((message, index) => {
                  const isTherapist = message.senderId === 'therapist';
                  const showDate =
                    index === 0 ||
                    new Date(message.timestamp).toDateString() !==
                      new Date(chatMessages[index - 1].timestamp).toDateString();

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                            {new Date(message.timestamp).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}

                      <div className={`flex ${isTherapist ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-md px-4 py-2 rounded-2xl ${
                            isTherapist
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div
                            className={`flex items-center gap-1 mt-1 text-xs ${
                              isTherapist ? 'text-blue-100 justify-end' : 'text-gray-500'
                            }`}
                          >
                            <span>{formatMessageTime(message.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-2 max-w-4xl mx-auto">
                <Input
                  placeholder="Написать сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  multiline
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="icon"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Выберите чат
              </h3>
              <p className="text-gray-500">
                Выберите клиента из списка, чтобы начать переписку
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
