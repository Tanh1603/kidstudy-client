/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/order */
"use client";

import { useState, useEffect, useCallback } from "react";

import { useUser, useAuth } from "@clerk/nextjs";
import Image from "next/image";

import UserProgressDTO from "@/app/models/UserProgressDTO";
import { getUserProgress } from "@/app/services/user-progress";
import { FeedWrapper } from "@/components/feed-wrapper";
import { FriendProgres } from "@/components/friend-progres";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { UserProgress } from "@/components/user-progress";
import { toast } from "sonner";
import Loading from "@/components/loading";

const API = process.env.NEXT_PUBLIC_BASE_API_URL;

interface Friend {
  sender_email: string;
}

interface FriendRequest {
  id: string;
  sender_email: string;
}

interface FriendsApiResponse {
  message?: string;
}

export default function UserProfile() {
  const { user, isLoaded } = useUser();
  const { userId, getToken } = useAuth();

  const [receiverEmail, setReceiverEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgressDTO>();
  const [friendsProgress, setFriendsProgress] = useState<
    Record<string, UserProgressDTO>
  >({});
  interface GiftResponse {
    message?: string;
    error?: string;
  }

  // Fetch friends and friend requests
  useEffect(() => {
    if (!user?.emailAddresses[0]?.emailAddress) return;

    const userEmail = user.emailAddresses[0].emailAddress;

    const fetchFriendsData = async () => {
      try {
        const [friendsResponse, requestsResponse] = await Promise.all([
          fetch(`${API}/user/friends/${userEmail}`),
          fetch(`${API}/user/friends/requests/${userEmail}`),
        ]);

        if (friendsResponse.ok) {
          const friendsData: Friend[] =
            (await friendsResponse.json()) as Friend[];
          setFriends(friendsData);
        }

        if (requestsResponse.ok) {
          const requestsData: FriendRequest[] =
            (await requestsResponse.json()) as FriendRequest[];
          setFriendRequests(requestsData);
        }
      } catch (error) {
        console.error("Error fetching friends data:", error);
      }
    };

    void fetchFriendsData();
  }, [user?.emailAddresses]);

  // Fetch user progress
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!userId || !getToken) return;

      try {
        setLoading(true);
        const token = await getToken();
        if (!token) return;

        const userProgressData = await getUserProgress(token, userId);
        setUserProgress(userProgressData);
      } catch (error) {
        console.error("Error fetching user progress:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchUserProgress();
  }, [userId, getToken]);

  //fetch Friend Progress
  useEffect(() => {
    if (friends.length === 0) return;
    const fetchFriendsProgress = async () => {
      try {
        const results = await Promise.all(
          friends.map(async (friend) => {
            const res = await fetch(
              `${API}/user/user-progress/email/${friend.sender_email}`
            );
            const data = (await res.json()) as UserProgressDTO;
            return { email: friend.sender_email, progress: data };
          })
        );

        setFriendsProgress(
          results.reduce(
            (acc, item) => {
              acc[item.email] = item.progress;
              return acc;
            },
            {} as Record<string, UserProgressDTO>
          )
        );
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchFriendsProgress()
      .then(() => console.log("Fetch thành công"))
      .catch((error) => console.error("Lỗi khi fetch:", error));
  }, [friends]);

  const handleSendRequest = useCallback(async () => {
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      setMessage("Bạn chưa đăng nhập!");
      return;
    }

    if (!receiverEmail.trim()) {
      setMessage("Vui lòng nhập email người nhận!");
      return;
    }
    // Kiểm tra điều kiện nâng cao (không tự gửi & chưa là bạn bè)
    const isValid = await validateReceiver(userEmail, receiverEmail.trim());
    if (!isValid) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/user/friends/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: userEmail,
          receiverEmail: receiverEmail.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FriendsApiResponse =
        (await response.json()) as FriendsApiResponse;
      setMessage(data.message ?? "Đã gửi lời mời thành công!");
      setReceiverEmail(""); // Clear input after success
    } catch (error) {
      console.error("Error sending friend request:", error);
      setMessage("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, [user?.emailAddresses, receiverEmail]);

  const handleAccept = useCallback(async (requestId: string) => {
    try {
      const response = await fetch(`${API}/user/friends/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.info("Đã chấp nhận lời mời!");
      setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
      window.location.reload();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Có lỗi xảy ra khi chấp nhận lời mời!");
    }
  }, []);

  const handleSendRequestWrapper = useCallback(() => {
    void handleSendRequest();
  }, [handleSendRequest]);

  const handleDecline = useCallback(async (requestId: string) => {
    try {
      const response = await fetch(`${API}/user/friends/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.info("Đã từ chối lời mời!");
      setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
      window.location.reload();
    } catch (error) {
      console.error("Error declining friend request:", error);
      toast.error("Có lỗi xảy ra khi từ chối lời mời!");
    }
  }, []);

  const handleAcceptWrapper = useCallback(
    (requestId: string) => {
      return () => {
        void handleAccept(requestId);
      };
    },
    [handleAccept]
  );

  const handleDeclineWrapper = useCallback(
    (requestId: string) => {
      return () => {
        void handleDecline(requestId);
      };
    },
    [handleDecline]
  );

  if (!isLoaded || !user || !userProgress) {
    return <Loading />;
  }

  const sendHeart = async (receiverEmail: string) => {
    try {
      if (userProgress.tickets <= 0) {
        toast.info("Bạn không còn tim để tặng!");
        return;
      }
      const senderEmail = user?.emailAddresses[0].emailAddress;

      const response = await fetch(`${API}/user/friends/gift`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ senderEmail, receiverEmail }),
      });

      const data = (await response.json()) as GiftResponse;

      if (response.ok) {
        window.location.reload(); // làm mới cửa sổ
      } else {
        toast.error(`Lỗi: ${data.error || "Có lỗi xảy ra!"}`);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };
  interface CheckEmailResponse {
    exists: boolean;
    valid: boolean;
    message: string;
  }
  const validateReceiver = async (
    receiverEmail: string,
    senderEmail: string
  ): Promise<boolean> => {
    // 1. Kiểm tra email có tồn tại
    const existsRes = await fetch(
      `${API}/user/friends/check-email/${receiverEmail}`
    );
    const existsData = (await existsRes.json()) as CheckEmailResponse;
    if (!existsData.exists) {
      toast.error("Email người nhận không tồn tại.");
      return false;
    }

    // 2. Kiểm tra đã là bạn bè chưa và khác chính mình
    const friendRes = await fetch(
      `${API}/user/friends/validate/${senderEmail}/${receiverEmail}`
    );
    const friendData = (await friendRes.json()) as CheckEmailResponse;
    if (!friendData.valid) {
      toast.error(friendData.message || "Không thể gửi tim.");
      return false;
    }

    return true;
  };

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress hasActiveSubscription={false} />
        <Quests />
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

          <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
            <h1 className="mb-4 text-xl font-bold">Bạn bè</h1>

            <h2 className="mt-4">Gửi lời mời kết bạn</h2>
            <input
              type="email"
              placeholder="Nhập Email người nhận"
              value={receiverEmail}
              onChange={(e) => setReceiverEmail(e.target.value)}
              className="mb-2 w-full rounded border p-2"
            />
            <button
              onClick={handleSendRequestWrapper}
              disabled={loading}
              className="rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi lời mời"}
            </button>
            {message && (
              <p
                className={`mt-2 ${message.includes("lỗi") ? "text-red-500" : "text-green-500"}`}
              >
                {message}
              </p>
            )}

            <h2 className="mt-6">Danh sách bạn bè</h2>
            {friends.length > 0 ? (
              <ul className="mt-2">
                {friends.map((friend) => (
                  <li
                    key={friend.sender_email}
                    className="mb-2 flex items-center justify-between rounded border p-2"
                  >
                    <span className="font-bold">{friend.sender_email}</span>

                    <FriendProgres
                      hearts={friendsProgress[friend.sender_email]?.hearts} // ✅ Kiểm tra dữ liệu
                      points={friendsProgress[friend.sender_email]?.points}
                      hasActiveSubscription={false}
                    />
                    <Button
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => {
                        void sendHeart(friend.sender_email);
                      }}
                    >
                      <Image
                        src="/gift.png"
                        height={40}
                        width={40}
                        alt="Tặng tim"
                        className="mr-2"
                      />
                    </Button>
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
                  <li key={request.id} className="mb-2 rounded border p-2">
                    <span className="font-bold">{request.sender_email}</span>
                    <Button
                      className="ml-4 rounded bg-green-500 px-2 py-1 text-white transition hover:bg-green-600"
                      onClick={handleAcceptWrapper(request.id)}
                    >
                      Chấp nhận
                    </Button>
                    <Button
                      className="ml-2 rounded bg-red-500 px-2 py-1 text-white transition hover:bg-red-600"
                      onClick={handleDeclineWrapper(request.id)}
                    >
                      Từ chối
                    </Button>
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
