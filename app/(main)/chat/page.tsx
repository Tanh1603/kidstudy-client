"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { FeedWrapper } from "@/components/feed-wrapper";
// import { Promo } from "@/components/promo";
import Image from "next/image";
import {  useAuth } from "@clerk/nextjs";
import UserProgressDTO from "@/app/models/UserProgressDTO";
import { getLeaderboard, getUserProgress } from "@/app/services/user-progress";

import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserProgress } from "@/components/user-progress";
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
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [friends, setFriends] = useState<{ sender_id: string }[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ id: string; sender_id: string }[]>([]);
    const { userId, getToken } = useAuth();
    const [userProgress, setUserProgress] = useState<UserProgressDTO>();

  useEffect(() => {
    if (!user?.fullName) return;
    fetchMessages();
        const fetchLeaderboard = async () => {
      
    };
  }, [user?.fullName]);

  useEffect(() => {
    // 🔹 Khi danh sách tin nhắn thay đổi, tự động cuộn xuống
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  async function fetchMessages() {
    try {
      const response = await fetch("http://localhost:8080/api/v1/user/chat/get_messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.fullName }),
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
    }
  }

  async function sendMessage() {
    if (!user?.fullName) {
      alert("Bạn chưa đăng nhập!");
      return;
    }
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung tin nhắn.");
      return;
    }
    setLoading(true);
    try {
      await fetch("http://localhost:8080/api/v1/user/chat/send_messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.fullName,
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
useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const [userProgressData] = await Promise.all([
          getUserProgress(token as string, userId as string),
        ]);

        setUserProgress(userProgressData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    void fetchLeaderboard();
  }, [userId, getToken]);

  if (!isLoaded) return <p>Đang tải...</p>;
  if (!user) return <p>Người dùng chưa đăng nhập.</p>;
  if (!userProgress) return null;

  return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          // activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          // hasActiveSubscription={isPro}
          hasActiveSubscription={false}
        />
        {/* {!isPro && <Promo />} */}
        <Quests points={userProgress.points} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <Image
            src="/chat.svg"
            alt="Leaderboard"
            height={40}
            width={40}
          />
        <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
              Chat
            </h1>
        <div className="max-w-xl mx-auto p-4">
        <Separator className="mb-4 h-0.5 rounded-full" />
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();  // Gửi tin nhắn khi nhấn Enter
            }
          }}
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
        </div>
      </FeedWrapper>
    </div>
    
  );
}
