"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { FeedWrapper } from "@/components/feed-wrapper";

interface Message {
  user_id: string;
  content: string;
  created_at: string;
}
export default function Chat() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null); // 🔹 Khai báo WebSocket đúng kiểu

  useEffect(() => {
      // 🔹 Lấy lịch sử tin nhắn trước
      const fetchMessages = async () => {
          try {
              const response = await fetch("https://websocket-q6kl.onrender.com/messages");
              const data: Message[] = await response.json();
              console.log("📥 Dữ liệu từ API:", data); // Debug log
              setMessages(data); 
          } catch (error) {
              console.error("❌ Lỗi khi tải lịch sử tin nhắn:", error);
          }
      };
      
      fetchMessages();
  }, []); // Chạy riêng khi component mount

  // 🔹 WebSocket connection riêng biệt
  useEffect(() => {
      wsRef.current = new WebSocket("https://websocket-q6kl.onrender.com");
      
      wsRef.current.onopen = () => {
          console.log("🔗 Kết nối WebSocket thành công!");
      };
      
      wsRef.current.onmessage = (event) => {
          const newMessage: Message = JSON.parse(event.data);
          console.log("📨 Tin nhắn mới từ WebSocket:", newMessage); // Debug log
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          
          setTimeout(() => {
              chatContainerRef.current?.scrollTo({ 
                  top: chatContainerRef.current.scrollHeight, 
                  behavior: "smooth" 
              });
          }, 100);
      };
      
      wsRef.current.onclose = () => {
          console.log("❌ Mất kết nối WebSocket server!");
      };
      
      wsRef.current.onerror = (error) => {
          console.error("⚠️ Lỗi WebSocket:", error);
      };
      
      return () => {
          wsRef.current?.close();
      };
  }, []);
  const sendMessage = () => {
    if (content.trim() && wsRef.current) { // 🔹 Kiểm tra WebSocket trước khi gửi
      const messageData: Message = {
        user_id: user?.fullName ?? "Ẩn danh",
        content: content,
        created_at: new Date().toISOString(),
      };
      wsRef.current.send(JSON.stringify(messageData)); 
      setContent("");
    }
  };
  return (
    <FeedWrapper>
        
        <div className="flex w-full flex-col items-center">
        <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">Chat WebSocket</h1>
          <div className="max-w-3xl w-full mx-auto p-6">
            <div className="border rounded p-4 mb-4 h-[400px] overflow-auto bg-gray-50" ref={chatContainerRef}>
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={index} className="mb-2">
                            <span className="font-bold">{msg.user_id}</span>: <span>{msg.content}</span>
                            <div className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</div>
                        </div>
                    ))
                ) : (
                    <p>Chưa có tin nhắn nào.</p>
                )}
            </div>
            {/* Ô nhập tin nhắn */}
            <div className="flex">
            <input
                type="text"
                className="flex-1 p-2 border rounded"
                placeholder="Nhập tin nhắn..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
                }}
            />
            <button
                onClick={sendMessage}
                className="ml-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            >
                Gửi
            </button>
            </div>
        </div>
        </div>
    </FeedWrapper>
  );
}
