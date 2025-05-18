"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function UserProfile() {
  const { user, isLoaded } = useUser();
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<{ sender_id: string }[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ id: string; sender_id: string }[]>([]);

  // 🔹 Lấy danh sách bạn bè và lời mời kết bạn
  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:8080/user/friends/${user.id}`)
      .then((res) => res.json())
      .then((data) => setFriends(data));

    fetch(`http://localhost:8080/user/requests/${user.id}`)
      .then((res) => res.json())
      .then((data) => setFriendRequests(data));
  }, [user?.id]);

  async function handleSendRequest() {
    if (!user?.id) {
      setMessage("Bạn chưa đăng nhập!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/user/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user.id, receiverId }),
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
    await fetch("http://localhost:8080/user/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    alert("Đã chấp nhận lời mời!");
    setFriendRequests(friendRequests.filter((req) => req.id !== requestId));
    window.location.reload()
  }

  async function handleDecline(requestId: string) {
    await fetch("http://localhost:8080/user/decline", {
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

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">Bạn bè</h1>

      {/* 🔹 Gửi lời mời kết bạn */}
      <h2 className="mt-4">Gửi lời mời kết bạn</h2>
      <input
        type="text"
        placeholder="Nhập ID người nhận"
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

      {/* 🔹 Hiển thị danh sách bạn bè */}
      <h2 className="mt-6">Danh sách bạn bè</h2>
      {friends.length > 0 ? (
        <ul className="mt-2">
          {friends.map((friend) => (
            <li key={friend.sender_id} className="border p-2 rounded mb-2">
              {friend.sender_id}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-gray-500">Bạn chưa có bạn bè nào.</p>
      )}

      {/* 🔹 Hiển thị danh sách lời mời kết bạn */}
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
  );
}
