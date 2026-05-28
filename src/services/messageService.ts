import apiClient from "./api";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const E2EE_SALT = "BROWNS_HOTELS_E2EE_SALT_2026";

async function deriveKey(senderId: string, receiverId: string): Promise<CryptoKey> {
  const sortedIds = [senderId, receiverId].sort().join(":");
  const passwordString = `${sortedIds}:${E2EE_SALT}`;
  
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passwordString),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(E2EE_SALT),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessage(text: string, senderId: string, receiverId: string): Promise<string> {
  try {
    const key = await deriveKey(senderId, receiverId);
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(text)
    );
    
    // Convert IV to hex string
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, "0")).join("");
    
    // Convert Encrypted buffer to Base64
    const encryptedArray = new Uint8Array(encrypted);
    let binary = "";
    for (let i = 0; i < encryptedArray.byteLength; i++) {
      binary += String.fromCharCode(encryptedArray[i]);
    }
    const ciphertextBase64 = window.btoa(binary);
    
    return `e2ee:${ivHex}:${ciphertextBase64}`;
  } catch (err) {
    console.error("Encryption failed:", err);
    return text;
  }
}

export async function decryptMessage(envelope: string, senderId: string, receiverId: string): Promise<string> {
  if (!envelope.startsWith("e2ee:")) {
    return envelope; // Return legacy plaintext as fallback
  }
  
  try {
    const parts = envelope.split(":");
    if (parts.length !== 3) return envelope;
    
    const ivHex = parts[1];
    const ciphertextBase64 = parts[2];
    
    // Parse IV from hex
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    // Decode Base64 ciphertext
    const binary = window.atob(ciphertextBase64);
    const ciphertext = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      ciphertext[i] = binary.charCodeAt(i);
    }
    
    const key = await deriveKey(senderId, receiverId);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.error("Decryption failed:", err);
    return "🔑 [Decryption Error: Key mismatch or tampered data]";
  }
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
        const decryptedHistory = await Promise.all(
          response.data.data.map(async (msg: Message) => ({
            ...msg,
            message: await decryptMessage(msg.message, senderId, otherUserId)
          }))
        );
        return decryptedHistory;
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
      const encrypted = await encryptMessage(message, senderId, receiverId);
      const response = await apiClient.post("/Main/router-backend/api/messages", {
        sender_id: senderId,
        receiver_id: receiverId,
        message: encrypted,
      });
      if (response.data && response.data.success) {
        const msg = response.data.data;
        return {
          ...msg,
          message: await decryptMessage(msg.message, senderId, receiverId)
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to send message:", error);
      return null;
    }
  },
};
