import React, { useState, useEffect } from "react";
import { FiSearch, FiSend, FiMoreVertical, FiArrowLeft, FiActivity, FiUsers, FiCheckCircle, FiFolder, FiHardDrive, FiFileText, FiClock, FiMessageSquare, FiBell, FiClipboard, FiHome, FiSettings, FiShield } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { User } from "../../mock/users";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import { messageService, Message, getSafetyNumber } from "../../services/messageService";
import { hotelService } from "../../services/hotelService";
import apiClient from "../../services/api";

export const MessagingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  // Hotel Selection & Contacts list
  const [userHotels, setUserHotels] = useState<any[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");
  const [contacts, setContacts] = useState<User[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [safetyNumber, setSafetyNumber] = useState("");

  // Derive E2EE safety numbers when chat selection changes
  useEffect(() => {
    if (selectedChat && user?.id) {
      getSafetyNumber(user.id, selectedChat).then((num) => setSafetyNumber(num));
    } else {
      setSafetyNumber("");
    }
  }, [selectedChat, user?.id]);

  // Fetch pending verification requests count for Manager sidebar badge
  useEffect(() => {
    if (user?.role === "manager") {
      userService.getPendingUsers()
        .then((users) => setPendingCount(users.length))
        .catch(() => {});
    }
  }, [user]);

  // Fetch manager/staff associated hotels (or all hotels for super admin)
  useEffect(() => {
    if (user?.id) {
      if (user.role === "super_admin") {
        hotelService.getHotels()
          .then((hotelsList) => {
            setUserHotels(hotelsList);
            if (hotelsList.length > 0) {
              setSelectedHotelId(hotelsList[0].id);
            }
          })
          .catch((err) => {
            console.error("Failed to fetch hotels for super_admin:", err);
          });
      } else {
        apiClient.get(`/Main/router-backend/api/users/${user.id}`)
          .then((res) => {
            if (res.data && res.data.success) {
              const hotelsList = res.data.data.hotels || [];
              setUserHotels(hotelsList);
              if (hotelsList.length > 0) {
                setSelectedHotelId(hotelsList[0].id);
              }
            }
          })
          .catch((err) => {
            console.error("Failed to fetch user's hotels:", err);
          });
      }
    }
  }, [user]);

  // Fetch contacts for the selected hotel
  useEffect(() => {
    if (selectedHotelId) {
      setContactsLoading(true);
      const fetchHotelContacts = userService.getUsers({ hotel_id: selectedHotelId });
      const fetchAllUsers = userService.getUsers(); // To fetch super admin users globally

      Promise.all([fetchHotelContacts, fetchAllUsers])
        .then(([hotelUsers, allUsers]) => {
          const superAdmins = allUsers.filter((u) => u.role === "super_admin");
          const admins = allUsers.filter((u) => u.role === "admin");
          const combined = [...hotelUsers, ...superAdmins, ...admins];
          
          // Deduplicate by ID
          const uniqueUsers = Array.from(new Map(combined.map(item => [item.id, item])).values());
          
          // Filter out logged-in user and enforce role permissions
          const filtered = uniqueUsers.filter((u) => {
            if (u.id === user?.id) return false;
            
            if (user?.role === "super_admin") {
              // Super admins can ONLY message other admins (hotel admins) of the selected hotel
              return u.role === "admin" && u.hotelId === selectedHotelId;
            } else if (user?.role === "admin") {
              // Admins can message:
              // 1. Super admins (global)
              // 2. Admins in other hotels (role === "admin")
              // 3. Managers in his own hotel
              const isSuperAdmin = u.role === "super_admin";
              const isAdmin = u.role === "admin";
              // Use selectedHotelId (admin's assigned hotel) as fallback if user.hotelId is empty
              const adminHotelId = user.hotelId || selectedHotelId;
              const isManagerInOwnHotel = u.role === "manager" && u.hotelId === adminHotelId;
              return isSuperAdmin || isAdmin || isManagerInOwnHotel;
            } else {
              // Other roles can message: technician, manager, engineer, staff, admin in the hotel
              return ["technician", "manager", "engineer", "staff", "admin"].includes(u.role);
            }
          });
          
          setContacts(filtered);
        })
        .catch((err) => {
          console.error("Failed to fetch hotel contacts:", err);
        })
        .finally(() => {
          setContactsLoading(false);
        });
    } else {
      setContacts([]);
    }
  }, [selectedHotelId, user]);

  // Fetch chat history between current user and selected contact
  const fetchChatMessages = async () => {
    if (!user?.id || !selectedChat) return;
    try {
      const data = await messageService.getChatHistory(user.id, selectedChat);
      setChatMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  // Trigger initial chat loading when a contact is selected
  useEffect(() => {
    if (selectedChat) {
      setMessagesLoading(true);
      fetchChatMessages().finally(() => {
        setMessagesLoading(false);
      });
    } else {
      setChatMessages([]);
    }
  }, [selectedChat, user?.id]);

  // Setup real-time messaging using Server-Sent Events (SSE)
  useEffect(() => {
    if (!user?.id) return;

    const baseURL = apiClient.defaults.baseURL || "";
    const streamUrl = `${baseURL}/Main/router-backend/api/messages/stream?userId=${user.id}`;
    
    const eventSource = new EventSource(streamUrl, {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      try {
        const newMessage = JSON.parse(event.data);
        
        // If the new message belongs to the current chat room, fetch and decrypt it immediately
        if (
          selectedChat &&
          ((newMessage.sender_id === user.id && newMessage.receiver_id === selectedChat) ||
           (newMessage.sender_id === selectedChat && newMessage.receiver_id === user.id))
        ) {
          fetchChatMessages();
        }
      } catch (err) {
        console.error("Error parsing real-time message payload:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("Real-time stream connection lost/error, EventSource will automatically retry.", err);
    };

    return () => {
      eventSource.close();
    };
  }, [selectedChat, user?.id]);

  const getSidebarItems = () => {
    if (user?.role === "manager") {
      return [
        { icon: <FiActivity />, label: "Dashboard", active: false, onClick: () => navigate("/manager", { state: { activeTab: "overview" } }) },
        { icon: <FiUsers />, label: "User Management", active: false, onClick: () => navigate("/manager", { state: { activeTab: "users" } }) },
        { icon: <FiCheckCircle />, label: "Verification", active: false, onClick: () => navigate("/manager", { state: { activeTab: "verification" } }), badge: pendingCount },
        { icon: <FiFolder />, label: "Categories", active: false, onClick: () => navigate("/manager", { state: { activeTab: "categories" } }) },
        { icon: <FiHardDrive />, label: "Assets", active: false, onClick: () => navigate("/manager", { state: { activeTab: "assets" } }) },
        { icon: <FiFileText />, label: "Work Items", active: false, onClick: () => navigate("/manager", { state: { activeTab: "work-items" } }) },
        { icon: <FiClock />, label: "Schedules", active: false, onClick: () => navigate("/schedules") },
        { icon: <FiMessageSquare />, label: "Messages", active: true, onClick: () => navigate("/messages") },
      ];
    } else if (user?.role === "engineer") {
      return [
        { icon: <FiCheckCircle />, label: "Dashboard", active: false, onClick: () => navigate("/engineer", { state: { activeTab: "overview" } }) },
        { icon: <FiFileText />, label: "Work Items", active: false, onClick: () => navigate("/engineer", { state: { activeTab: "work-items" } }) },
        { icon: <FiClipboard />, label: "Reports", active: false, onClick: () => navigate("/engineer", { state: { activeTab: "reports" } }) },
        { icon: <FiClock />, label: "Schedule", active: false, onClick: () => navigate("/schedules") },
        { icon: <FiCheckCircle />, label: "Notifications", active: false, onClick: () => navigate("/engineer", { state: { activeTab: "notifications" } }) },
        { icon: <FiMessageSquare />, label: "Messages", active: true, onClick: () => navigate("/messages") },
      ];
    } else if (user?.role === "staff") {
      return [
        { icon: <FiBell />, label: "Dashboard", active: false, onClick: () => navigate("/staff", { state: { activeTab: "overview" } }) },
        { icon: <FiClock />, label: "My Schedule", active: false, onClick: () => navigate("/schedules") },
        { icon: <FiBell />, label: "Notifications", active: false, onClick: () => navigate("/staff", { state: { activeTab: "notifications" } }) },
        { icon: <FiMessageSquare />, label: "Messages", active: true, onClick: () => navigate("/messages") },
      ];
    } else if (user?.role === "super_admin") {
      return [
        { icon: <FiActivity />, label: "System Overview", active: false, onClick: () => navigate("/admin", { state: { activeTab: "overview" } }) },
        { icon: <FiUsers />, label: "Admin Management", active: false, onClick: () => navigate("/admin", { state: { activeTab: "users" } }) },
        { icon: <FiHome />, label: "Hotel Management", active: false, onClick: () => navigate("/admin", { state: { activeTab: "hotels" } }) },
        { icon: <FiMessageSquare />, label: "Messages", active: true, onClick: () => navigate("/messages") },
        { icon: <FiSettings />, label: "System Settings", active: false, onClick: () => navigate("/admin", { state: { activeTab: "settings" } }) },
      ];
    } else if (user?.role === "admin") {
      return [
        { icon: <FiUsers />, label: "User Management", active: false, onClick: () => navigate("/admin", { state: { activeTab: "users" } }) },
        { icon: <FiMessageSquare />, label: "Messages", active: true, onClick: () => navigate("/messages") },
      ];
    }
    return [];
  };

  const sidebarItems = getSidebarItems();

  const filteredConversations = contacts.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = contacts.find((u) => u.id === selectedChat);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !user?.id) return;
    const currentText = messageText;
    setMessageText(""); // Optimistically clear input
    try {
      const newMsg = await messageService.sendMessage(user.id, selectedChat, currentText);
      if (newMsg) {
        setChatMessages((prev) => [...prev, newMsg]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessageText(currentText); // Restore input on error
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} fullWidth={true}>
      <div className="flex h-full bg-slate-50 min-h-0">
        {/* Sidebar - Conversations List */}
        <div
          className={`bg-white border-r border-slate-200/80 flex flex-col w-full sm:w-80 sm:flex-shrink-0 ${
            selectedChat ? "hidden sm:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200/80 space-y-3">
            <h1 className="text-base font-semibold text-slate-900">Messages</h1>
            
            {/* Hotel Selector */}
            {userHotels.length > 0 && (
              <div>
                <label htmlFor="hotel-select" className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {user?.role === "super_admin" ? "Select Hotel" : "Active Hotel"}
                </label>
                <select
                  id="hotel-select"
                  value={selectedHotelId}
                  disabled={userHotels.length <= 1}
                  onChange={(e) => {
                    setSelectedHotelId(e.target.value);
                    setSelectedChat(null);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium text-slate-700 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {userHotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search team members…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-150"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {contactsLoading ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Loading contacts…
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm px-4 text-center">
                No team members found for this hotel.
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
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-xs text-slate-500 capitalize truncate">{conversation.role}</p>
                        {conversation.hotelName && user?.role !== "super_admin" && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium truncate max-w-[100px]" title={conversation.hotelName}>
                            {conversation.hotelName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedChat ? (
          <div className={`flex-1 flex flex-col bg-white ${selectedChat ? "flex" : "hidden sm:flex"}`}>
            {/* Chat Header */}
            <div className="px-4 sm:px-5 py-3 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-md transition-colors sm:hidden"
                  aria-label="Back to conversations"
                >
                  <FiArrowLeft size={18} className="text-slate-600" />
                </button>
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-xs">
                  {selectedUser?.name ? selectedUser.name.charAt(0) : "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selectedUser?.name || "User"}</p>
                  <p className="text-xs text-emerald-600 font-medium capitalize">
                    {selectedUser?.role || "Team member"}{selectedUser?.hotelName && user?.role !== "super_admin" ? ` • ${selectedUser.hotelName}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowVerifyModal(true)}
                  title="Verify Encryption Keys"
                  className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-md transition-colors duration-150"
                  aria-label="Verify Encryption Keys"
                >
                  <FiShield size={16} />
                </button>
                <button className="p-2 hover:bg-slate-50 rounded-md transition-colors duration-150">
                  <FiMoreVertical size={16} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-thin bg-slate-50/50">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  Loading chat history…
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <FiSend className="text-slate-400" size={20} />
                    </div>
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-xs px-3.5 py-2 rounded-lg text-sm ${
                        msg.sender_id === user?.id
                          ? "bg-primary-600 text-white rounded-br-sm"
                          : "bg-white border border-slate-200 text-slate-900 rounded-bl-sm shadow-sm"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-primary-200" : "text-slate-400"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600">
              <FiShield size={24} />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Verify Encryption</h2>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
              Verify safety numbers to confirm all messages are secured with Perfect Forward Secrecy.
            </p>
            
            {/* QR Code */}
            <div className="p-3 border border-slate-100 bg-slate-50 rounded-lg mb-6 shadow-sm flex justify-center items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  safetyNumber
                )}`}
                alt="Safety Number QR Code"
                className="w-36 h-36 object-contain"
              />
            </div>
            
            {/* Safety Numbers */}
            <div className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-center mb-6">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Safety Numbers
              </label>
              <span className="font-mono text-sm font-bold text-slate-800 tracking-widest break-all">
                {safetyNumber}
              </span>
            </div>
            
            <button
              onClick={() => setShowVerifyModal(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MessagingPage;
