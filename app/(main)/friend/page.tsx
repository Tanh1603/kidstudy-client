"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

import {  useAuth } from "@clerk/nextjs";
import Image from "next/image";

import UserProgressDTO from "@/app/models/UserProgressDTO";
import { getUserProgress } from "@/app/services/user-progress";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { UserProgress1 } from "@/components/friend-progres";



export default function UserProfile() {
  const { user, isLoaded } = useUser();
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<{ sender_id: string }[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ id: string; sender_id: string }[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressDTO>();
  const { userId, getToken } = useAuth();


  // 🔹 Lấy danh sách bạn bè và lời mời kết bạn
  useEffect(() => {
    
    if (!user?.emailAddresses[0].emailAddress) return;
    fetch(`http://localhost:8080/api/v1/user/friends/${user.emailAddresses[0].emailAddress}`)
      .then((res) => res.json())
      .then((data) => setFriends(data));

    fetch(`http://localhost:8080/api/v1/user/friends/requests/${user.emailAddresses[0].emailAddress}`)
      .then((res) => res.json())
      .then((data) => setFriendRequests(data));

    const fetchLeaderboard = async () => {
      
    };
  }, [user?.emailAddresses[0].emailAddress]);

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


  async function handleSendRequest() {
    if (!user?.emailAddresses[0].emailAddress) {
      setMessage("Bạn chưa đăng nhập!");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/v1/user/friends/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user.emailAddresses[0].emailAddress, receiverId }),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(requestId: string) {
    await fetch("http://localhost:8080/api/v1/user/friends/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    alert("Đã chấp nhận lời mời!");
    setFriendRequests(friendRequests.filter((req) => req.id !== requestId));
    window.location.reload()
  }

  async function handleDecline(requestId: string) {
    await fetch("http://localhost:8080/api/v1/user/friends/decline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    alert("Đã từ chối lời mời!");
    setFriendRequests(friendRequests.filter((req) => req.id !== requestId));
    window.location.reload()
  }

  if (!isLoaded) return <p>Đang tải...</p>;
  if (!user) return <p>Người dùng chưa đăng nhập.</p>;
  if (!userProgress) return null;
  return (
      <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          //activeCourse={userProgress.activeCourse}
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
            <Image src="/friend.svg" alt="Shop" height={120} width={120} />
  
            <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
              Friend
            </h1>
            <p className="mb-6 text-center text-lg text-muted-foreground">
              Let make new friend.
            </p>
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
              <h1 className="text-xl font-bold mb-4">Bạn bè</h1>
              <h2 className="mt-4">Gửi lời mời kết bạn</h2>
              <input
                type="text"
                placeholder="Nhập Email người nhận"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              <button
                onClick={handleSendRequest}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
              {loading ? "Đang gửi..." : "Gửi lời mời"}
              </button>
              {message && <p className="mt-2 text-green-500">{message}</p>}
              <h2 className="mt-6">Danh sách bạn bè</h2>
              {friends.length > 0 ? (
                <ul className="mt-2">
                  {friends.map((friend) => (
                    <li key={friend.sender_id} className="border p-2 rounded mb-2 flex items-center justify-between">
                      <span>{friend.sender_id}</span>
                      <UserProgress1
                                //activeCourse={userProgress.activeCourse}
                                hearts={userProgress.hearts}
                                points={userProgress.points}
                                // hasActiveSubscription={isPro}
                                hasActiveSubscription={false}
                              />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-gray-500">Bạn chưa có bạn bè nào.</p>
              )}

          
              <h2 className="mt-6">Lời mời kết bạn</h2>
              {friendRequests.length > 0 ? (
                <ul className="mt-2">
                  {friendRequests.map((request) => (
                    <li key={request.id} className="border p-2 rounded mb-2">
                      {request.sender_id}
                      <button
                        className="ml-4 bg-green-500 text-white px-2 py-1 rounded"
                        onClick={() => handleAccept(request.id)}
                      >
                        Chấp nhận
                      </button>
                      <button
                        className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleDecline(request.id)}
                      >
                        Từ chối
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-gray-500">Không có lời mời nào.</p>
              )}
            </div>
          </div>
        </FeedWrapper>   
      </div>
    
  );
}
