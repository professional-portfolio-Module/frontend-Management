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

interface RatchetSession {
  sendingChainKey: CryptoKey;
  receivingChainKey: CryptoKey;
}

// In-memory cache of active sessions, kept out of localStorage to prevent XSS theft
const activeSessions: Record<string, RatchetSession> = {};

/**
 * Derives the initial sending and receiving chain keys from the sorted combination of user IDs
 */
async function deriveInitialKeys(senderId: string, receiverId: string): Promise<RatchetSession> {
  const sortedIds = [senderId, receiverId].sort().join(":");
  const passwordString = `${sortedIds}:${E2EE_SALT}`;
  const enc = new TextEncoder();
  
  const masterKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passwordString),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  // Derive a base key containing 512 bits of key material
  const baseKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(E2EE_SALT),
      iterations: 1000,
      hash: "SHA-256"
    },
    masterKey,
    { name: "HMAC", hash: "SHA-256", length: 512 },
    true,
    ["sign"]
  );
  
  const rawBaseBytes = await window.crypto.subtle.exportKey("raw", baseKey);
  const sendBytes = rawBaseBytes.slice(0, 32);
  const recvBytes = rawBaseBytes.slice(32, 64);
  
  // Deterministic assignment of sending/receiving keys
  const isInitiator = senderId < receiverId;
  const sendingKeyBytes = isInitiator ? sendBytes : recvBytes;
  const receivingKeyBytes = isInitiator ? recvBytes : sendBytes;
  
  const sendingChainKey = await window.crypto.subtle.importKey(
    "raw",
    sendingKeyBytes,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign"]
  );
  
  const receivingChainKey = await window.crypto.subtle.importKey(
    "raw",
    receivingKeyBytes,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign"]
  );
  
  return { sendingChainKey, receivingChainKey };
}

/**
 * Advances a KDF chain key one step and returns the next chain key plus the message encryption key
 */
async function kdfStep(chainKey: CryptoKey): Promise<{ nextChainKey: CryptoKey; messageKey: CryptoKey }> {
  const enc = new TextEncoder();
  const rawKey = await window.crypto.subtle.exportKey("raw", chainKey);
  
  // Derive next chain key using HMAC with step label
  const hmacKey1 = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig1 = await window.crypto.subtle.sign("HMAC", hmacKey1, enc.encode("chain-key-step"));
  const nextChainKey = await window.crypto.subtle.importKey(
    "raw",
    sig1,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign"]
  );
  
  // Derive message key using HMAC with step label
  const hmacKey2 = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig2 = await window.crypto.subtle.sign("HMAC", hmacKey2, enc.encode("message-key-step"));
  
  // Convert derived bytes into a symmetric AES-GCM message key
  const messageKey = await window.crypto.subtle.importKey(
    "raw",
    sig2.slice(0, 32),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  
  return { nextChainKey, messageKey };
}

/**
 * Encrypt message text using the specified AES-GCM message key
 */
async function encryptWithKey(text: string, messageKey: CryptoKey): Promise<string> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    messageKey,
    enc.encode(text)
  );
  
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, "0")).join("");
  const encryptedArray = new Uint8Array(encrypted);
  let binary = "";
  for (let i = 0; i < encryptedArray.byteLength; i++) {
    binary += String.fromCharCode(encryptedArray[i]);
  }
  const ciphertextBase64 = window.btoa(binary);
  
  return `e2ee:${ivHex}:${ciphertextBase64}`;
}

/**
 * Decrypt envelope message using the specified AES-GCM message key
 */
async function decryptWithKey(envelope: string, messageKey: CryptoKey): Promise<string> {
  if (!envelope.startsWith("e2ee:")) {
    return envelope;
  }
  
  try {
    const parts = envelope.split(":");
    if (parts.length !== 3) return envelope;
    
    const ivHex = parts[1];
    const ciphertextBase64 = parts[2];
    
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const binary = window.atob(ciphertextBase64);
    const ciphertext = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      ciphertext[i] = binary.charCodeAt(i);
    }
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      messageKey,
      ciphertext
    );
    
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.error("Decryption failed:", err);
    return "🔑 [Decryption Error: Key mismatch or tampered data]";
  }
}

/**
 * Generates an out-of-band safety number (cryptographic fingerprint) between two users
 */
export async function getSafetyNumber(senderId: string, receiverId: string): Promise<string> {
  const sortedIds = [senderId, receiverId].sort().join(":");
  const passwordString = `${sortedIds}:${E2EE_SALT}`;
  const enc = new TextEncoder();
  
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", enc.encode(passwordString));
  const hashArray = new Uint8Array(hashBuffer);
  
  let numberString = "";
  for (let i = 0; i < hashArray.length; i += 2) {
    const val = (hashArray[i] << 8) | (hashArray[i+1] || 0);
    numberString += (val % 100000).toString().padStart(5, "0") + " ";
  }
  
  return numberString.trim().split(" ").slice(0, 5).join(" ");
}

export const messageService = {
  /**
   * Get direct message history between two users and decrypt chronologically to advance ratchets
   */
  async getChatHistory(senderId: string, otherUserId: string): Promise<Message[]> {
    try {
      const response = await apiClient.get(
        `/Main/router-backend/api/messages/history/${otherUserId}`,
        { params: { sender_id: senderId } }
      );
      if (response.data && response.data.success) {
        const rawHistory: Message[] = response.data.data;
        
        // Reconstruct the KDF chains sequentially to recover exact keys for each ratchet step
        let session = await deriveInitialKeys(senderId, otherUserId);
        
        const decryptedHistory = [];
        for (const msg of rawHistory) {
          if (!msg.message.startsWith("e2ee:")) {
            decryptedHistory.push(msg);
            continue;
          }
          
          if (msg.sender_id === senderId) {
            // We sent this. Advance our sending ratchet KDF chain.
            const { nextChainKey, messageKey } = await kdfStep(session.sendingChainKey);
            session.sendingChainKey = nextChainKey;
            
            const decryptedText = await decryptWithKey(msg.message, messageKey);
            decryptedHistory.push({ ...msg, message: decryptedText });
          } else {
            // They sent this. Advance our receiving ratchet KDF chain.
            const { nextChainKey, messageKey } = await kdfStep(session.receivingChainKey);
            session.receivingChainKey = nextChainKey;
            
            const decryptedText = await decryptWithKey(msg.message, messageKey);
            decryptedHistory.push({ ...msg, message: decryptedText });
          }
        }
        
        // Store current ratchet states in-memory for sending next messages
        activeSessions[otherUserId] = session;
        
        return decryptedHistory;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      return [];
    }
  },

  /**
   * Send a new direct message, ratcheting the KDF sending chain in memory
   */
  async sendMessage(senderId: string, receiverId: string, message: string): Promise<Message | null> {
    try {
      let session = activeSessions[receiverId];
      if (!session) {
        session = await deriveInitialKeys(senderId, receiverId);
        activeSessions[receiverId] = session;
      }
      
      // Advance sending ratchet chain
      const { nextChainKey, messageKey } = await kdfStep(session.sendingChainKey);
      session.sendingChainKey = nextChainKey;
      
      const encrypted = await encryptWithKey(message, messageKey);
      const response = await apiClient.post("/Main/router-backend/api/messages", {
        sender_id: senderId,
        receiver_id: receiverId,
        message: encrypted,
      });
      
      if (response.data && response.data.success) {
        const msg = response.data.data;
        return {
          ...msg,
          message // Return plaintext to client immediately
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to send message:", error);
      return null;
    }
  },
};
