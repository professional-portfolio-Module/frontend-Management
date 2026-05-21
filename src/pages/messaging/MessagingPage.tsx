import React, { useState } from "react";
import { FiSearch, FiSend, FiMoreVertical, FiPhone, FiVideo, FiPlus, FiArrowLeft } from "react-icons/fi";
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

  const conversations = mockUsers.filter((u) => u.id !== user?.id);
  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chatMessages = selectedChat
    ? messages.filter(
        (msg) =>
          (msg.senderId === user?.id && msg.receiverId === selectedChat) ||
          (msg.senderId === selectedChat && msg.receiverId === user?.id)
      )
    : [];

  const selectedUser = conversations.find((u) => u.id === selectedChat);

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
    <div className="flex h-[calc(100vh-56px)] bg-slate-50">
      {/* Sidebar - Conversations List */}
      {/* On mobile: show full-width when no chat selected, hide when chat is open */}
      <div
        className={`bg-white border-r border-slate-200/80 flex flex-col w-full sm:w-80 sm:flex-shrink-0 ${
          selectedChat ? "hidden sm:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200/80">
          <h1 className="text-base font-semibold text-slate-900 mb-3">Messages</h1>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedChat(conversation.id)}
                className={`px-4 py-3 cursor-pointer transition-all duration-100 border-b border-slate-100/80 ${
                  selectedChat === conversation.id
                    ? "bg-primary-50/60 border-l-2 border-l-primary-500"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                    {conversation.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{conversation.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{conversation.role}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Message Button */}
        <div className="p-3 border-t border-slate-200/80">
          <Button fullWidth variant="secondary" className="gap-2">
            <FiPlus size={16} />
            New Message
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      {/* On mobile: show full-width when chat is selected */}
      {selectedChat ? (
        <div className={`flex-1 flex flex-col bg-white ${selectedChat ? "flex" : "hidden sm:flex"}`}>
          {/* Chat Header */}
          <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back button - mobile only */}
              <button
                onClick={() => setSelectedChat(null)}
                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors sm:hidden"
                aria-label="Back to conversations"
              >
                <FiArrowLeft size={18} className="text-slate-600" />
              </button>
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-xs">
                {selectedUser?.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedUser?.name}</p>
                <p className="text-xs text-emerald-600 font-medium">Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-slate-50 rounded-md transition-colors duration-150 hidden sm:block">
                <FiPhone size={16} className="text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-md transition-colors duration-150 hidden sm:block">
                <FiVideo size={16} className="text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-md transition-colors duration-150">
                <FiMoreVertical size={16} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-thin bg-slate-50/50">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <FiSend className="text-slate-400" size={20} />
                  </div>
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-xs px-3.5 py-2 rounded-lg text-sm ${
                      msg.senderId === user?.id
                        ? "bg-primary-600 text-white rounded-br-sm"
                        : "bg-white border border-slate-200 text-slate-900 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.senderId === user?.id ? "text-primary-200" : "text-slate-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-3 sm:p-4 border-t border-slate-200/80 bg-white">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Type a message…"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden sm:flex items-center justify-center bg-slate-50">
          <div className="text-center text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FiSend size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPage;
