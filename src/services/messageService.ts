import apiClient from "./api";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const messageService = {
  /**
   * Get direct message history between two users
   */
  async getChatHistory(senderId: string, otherUserId: string): Promise<Message[]> {
    try {
      const response = await apiClient.get(
        `/Main/router-backend/api/messages/history/${otherUserId}`,
        { params: { sender_id: senderId } }
      );
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      return [];
    }
  },

  /**
   * Send a new direct message
   */
  async sendMessage(senderId: string, receiverId: string, message: string): Promise<Message | null> {
    try {
      const response = await apiClient.post("/Main/router-backend/api/messages", {
        sender_id: senderId,
        receiver_id: receiverId,
        message,
      });
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to send message:", error);
      return null;
    }
  },
};
