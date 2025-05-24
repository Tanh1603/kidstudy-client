"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null); // Tham chiếu đến khung chat

  useEffect(() => {
    if (!user?.id) return;
    fetchMessages();
  }, [user?.id]);

  useEffect(() => {
    // 🔹 Khi danh sách tin nhắn thay đổi, tự động cuộn xuống
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  async function fetchMessages() {
    try {
      const response = await fetch("http://localhost:8080/user/get_messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
    }
  }

  async function sendMessage() {
    if (!user?.id) {
      alert("Bạn chưa đăng nhập!");
      return;
    }
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung tin nhắn.");
      return;
    }
    setLoading(true);
    try {
      await fetch("http://localhost:8080/user/send_messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userName: user.fullName || user.username,
          content: content,
        }),
      });
      setContent("");
      fetchMessages();
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) return <p>Đang tải...</p>;
  if (!user) return <p>Người dùng chưa đăng nhập.</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <div
        className="border rounded p-4 mb-4 h-[400px] overflow-auto bg-gray-50"
        ref={chatContainerRef} // 🔹 Tham chiếu khung chat
      >
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <span className="font-bold">{msg.user_id}</span>:{" "}
              <span>{msg.content}</span>
              <div className="text-xs text-gray-500">
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p>Chưa có tin nhắn nào.</p>
        )}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="Nhập tin nhắn..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="ml-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          {loading ? "Đang gửi..." : "Gửi"}
        </button>
      </div>
    </div>
  );
}
