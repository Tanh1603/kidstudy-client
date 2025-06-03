/* eslint-disable import/order */
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bot } from "lucide-react";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AICharacter {
  name: string;
  avatar: string;
  color: string;
  systemPrompt: string;
}

const AICharacters: AICharacter[] = [
  {
    name: "Friendly Buddy",
    avatar: "…",
    color: "bg-gradient-to-r from-blue-400 to-blue-600",
    systemPrompt: `You are a friendly and patient English teacher for children. …`,
  },
  {
    name: "Story Master",
    avatar: "…",
    color: "bg-gradient-to-r from-purple-400 to-purple-600",
    systemPrompt: `You are a creative English teacher who loves telling stories. …`,
  },
  {
    name: "Grammar Guru",
    avatar: "…",
    color: "bg-gradient-to-r from-green-400 to-green-600",
    systemPrompt: `You are a precise and knowledgeable English grammar teacher. …`,
  },
];

export default function AIChatbot() {
  const [messagesByCharacter, setMessagesByCharacter] = useState<
    Record<string, Message[]>
  >({
    "friendly-buddy": [],
    "story-master": [],
    "grammar-guru": [],
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<AICharacter>(
    AICharacters[0]
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const characterId = selectedCharacter.name.toLowerCase().replace(" ", "-");

    const updatedMessages = [...messagesByCharacter[characterId], userMessage];

    setMessagesByCharacter((prev) => ({
      ...prev,
      [characterId]: updatedMessages,
    }));

    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post<ChatCompletionResponse>(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            { role: "system", content: selectedCharacter.systemPrompt },
            ...updatedMessages,
          ],
          temperature: 0.7,
          max_tokens: 150,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          },
        }
      );

      const assistantMessage = response.data.choices[0].message.content;

      setMessagesByCharacter((prev) => ({
        ...prev,
        [characterId]: [
          ...prev[characterId],
          { role: "assistant", content: assistantMessage },
        ],
      }));
    } catch (error) {
      console.error("Error:", error);
      setMessagesByCharacter((prev) => ({
        ...prev,
        [characterId]: [
          ...prev[characterId],
          {
            role: "assistant",
            content:
              "Oops! I'm having trouble connecting. Please try again! 😊",
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messagesByCharacter]);

  const handleCharacterChange = (character: AICharacter) => {
    setSelectedCharacter(character);
  };

  return (
    <Card className="mx-auto w-full max-w-2xl p-4">
      <Tabs defaultValue="friendly-buddy" className="w-full">
        <TabsList className="grid grid-cols-3 gap-2">
          {AICharacters.map((character) => (
            <TabsTrigger
              key={character.name}
              value={character.name.toLowerCase().replace(" ", "-")}
              onClick={() => handleCharacterChange(character)}
              className={`${character.color} text-xs text-white hover:opacity-90 sm:text-sm`}
            >
              {character.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {AICharacters.map((character) => {
          const characterId = character.name.toLowerCase().replace(" ", "-");
          const messages = messagesByCharacter[characterId];

          return (
            <TabsContent key={characterId} value={characterId} className="mt-4">
              <div className="mb-4 flex items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${character.color}`}
                >
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{character.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Your English Learning Partner
                  </p>
                </div>
              </div>

              <ScrollArea
                ref={scrollRef}
                className="mb-4 h-[400px] rounded border p-2"
              >
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${
                        message.role === "user"
                          ? "flex-row-reverse text-right"
                          : "text-left"
                      }`}
                    >
                      <div
                        className={`rounded-full p-2 ${
                          message.role === "user"
                            ? "bg-blue-100"
                            : "bg-green-100"
                        }`}
                      >
                        {message.role === "user" ? <User /> : <Bot />}
                      </div>
                      <div className="max-w-sm rounded bg-muted p-3 text-sm shadow">
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSubmit(e);
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  Send
                </Button>
              </form>
            </TabsContent>
          );
        })}
      </Tabs>
    </Card>
  );
}
