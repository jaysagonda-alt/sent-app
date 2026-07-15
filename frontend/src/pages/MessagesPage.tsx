import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

interface Message {
  id: string;
  content: string;
  fromId: string;
  from: { name: string; email: string };
  toId: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  userId: string;
  name: string;
  email: string;
  lastMessage?: string;
}

export default function MessagesPage() {
  const { user, logout } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/messages/conversations", {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });
      const data = await response.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
    setLoading(false);
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      const response = await fetch("http://localhost:3001/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify({ toId: selectedUserId, content: newMessage }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages(selectedUserId);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Header */}
      <div style={{ position: "fixed", top: 0, right: 0, padding: "20px" }}>
        <button onClick={logout} style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "white", border: "none", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {/* Conversations List */}
      <div style={{ width: "30%", borderRight: "1px solid #ddd", overflowY: "auto", paddingTop: "80px" }}>
        <h2 style={{ padding: "20px", borderBottom: "1px solid #ddd" }}>Messages</h2>
        {loading ? (
          <p style={{ padding: "20px" }}>Loading...</p>
        ) : conversations.length === 0 ? (
          <p style={{ padding: "20px" }}>No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.userId}
              onClick={() => setSelectedUserId(conv.userId)}
              style={{
                padding: "15px 20px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                backgroundColor: selectedUserId === conv.userId ? "#f0f0f0" : "white",
              }}
            >
              <strong>{conv.name}</strong>
              <p style={{ color: "#666", fontSize: "14px", margin: "5px 0 0 0" }}>{conv.email}</p>
              {conv.lastMessage && <p style={{ color: "#999", fontSize: "12px" }}>{conv.lastMessage}</p>}
            </div>
          ))
        )}
      </div>

      {/* Messages Area */}
      <div style={{ width: "70%", display: "flex", flexDirection: "column", paddingTop: "80px" }}>
        {selectedUserId ? (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {messages.length === 0 ? (
                <p>No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: "15px",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      backgroundColor: msg.fromId === user?.id ? "#007bff" : "#f0f0f0",
                      color: msg.fromId === user?.id ? "white" : "black",
                      maxWidth: "70%",
                      marginLeft: msg.fromId === user?.id ? "auto" : "0",
                    }}
                  >
                    <p style={{ margin: 0 }}>{msg.content}</p>
                    <span style={{ fontSize: "12px", opacity: 0.8 }}>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: "20px", borderTop: "1px solid #ddd", display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
              />
              <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
