import React, { useState } from "react";
import { FiSearch, FiSend, FiMoreVertical, FiPhone, FiVideo, FiPlus } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { mockUsers } from "../../mock/users";
import { mockMessages } from "../../mock/data";
import { Button } from "../../components/common/Button";

export const MessagingPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  // Get unique conversations
  const conversations = mockUsers.filter((u) => u.id !== user?.id);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get messages for selected chat
  const chatMessages = selectedChat
    ? messages.filter(
        (msg) =>
          (msg.senderId === user?.id && msg.receiverId === selectedChat) ||
          (msg.senderId === selectedChat && msg.receiverId === user?.id)
      )
    : [];

  const selectedUser = conversations.find((u) => u.id === selectedChat);

  // Handle send message
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return;

    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user?.id || "",
      receiverId: selectedChat,
      subject: "Message",
      content: messageText,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setMessageText("");
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">
      {/* Sidebar - Conversations List */}
      <div className="w-full sm:w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedChat(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                  selectedChat === conversation.id
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {conversation.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{conversation.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{conversation.role}</p>
                  </div>
                  {/* Status Indicator */}
                  <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Message Button */}
        <div className="p-4 border-t border-gray-200">
          <Button fullWidth className="gap-2 items-center justify-center">
            <FiPlus size={18} />
            New Message
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                {selectedUser?.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedUser?.name}</p>
                <p className="text-xs text-green-600 font-medium">Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-blue-200 rounded-lg transition-colors duration-200">
                <FiPhone size={20} className="text-blue-600" />
              </button>
              <button className="p-2 hover:bg-blue-200 rounded-lg transition-colors duration-200">
                <FiVideo size={20} className="text-blue-600" />
              </button>
              <button className="p-2 hover:bg-blue-200 rounded-lg transition-colors duration-200">
                <FiMoreVertical size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">💬</div>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === user?.id
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.senderId === user?.id ? "text-blue-100" : "text-gray-600"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">💭</div>
            <p className="text-lg">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPage;
