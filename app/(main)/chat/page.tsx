"use client";

import { useState, useEffect, useRef } from "react";

import { useUser } from "@clerk/clerk-react";

import { FeedWrapper } from "@/components/feed-wrapper";

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? "";

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
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${WEBSOCKET_URL}/messages`);
        if (!response.ok) throw new Error("Lỗi khi tải tin nhắn!");
        const data = (await response.json()) as Message[];
        setMessages(data);
      } catch (error) {
        console.error("❌ Lỗi tải tin nhắn:", error);
      }
    };

    void fetchMessages(); // ✅ Đánh dấu Promise để ESLint không cảnh báo
  }, []);

  useEffect(() => {
    if (!WEBSOCKET_URL) {
      console.error("⚠️ WEBSOCKET_URL không được cấu hình!");
      return;
    }

    wsRef.current = new WebSocket(WEBSOCKET_URL);

    wsRef.current.addEventListener("open", () => {
      console.log("🔗 Kết nối WebSocket thành công!");
    });

    wsRef.current.addEventListener("message", (event) => {
    try {
        if (typeof event.data === "string") { 
        const newMessage = JSON.parse(event.data) as Message;
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        setTimeout(() => {
            chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: "smooth",
            });
        }, 100);
        } else {
        console.error("⚠️ Dữ liệu WebSocket không phải là chuỗi hợp lệ:", event.data);
        }
    } catch (error) {
        console.error("❌ Lỗi xử lý tin nhắn WebSocket:", error);
    }
    });


    wsRef.current.addEventListener("close", () => {
      console.log("❌ Mất kết nối WebSocket!");
    });

    wsRef.current.addEventListener("error", (error) => {
      console.error("⚠️ Lỗi WebSocket:", error);
    });

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (!content.trim() || !wsRef.current) return;

    const messageData: Message = {
      user_id: user?.fullName ?? "Ẩn danh",
      content,
      created_at: new Date().toISOString(),
    };

    try {
      wsRef.current.send(JSON.stringify(messageData));
      setContent("");
    } catch (error) {
      console.error("⚠️ Lỗi gửi tin nhắn:", error);
    }
  };

  return (
    <FeedWrapper>
      <div className="flex w-full flex-col items-center">
        <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
          Chat WebSocket
        </h1>
        <div className="max-w-3xl w-full mx-auto p-6">
          <div
            className="border rounded p-4 mb-4 h-[400px] overflow-auto bg-gray-50"
            ref={chatContainerRef}
          >
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index} className="mb-2">
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
