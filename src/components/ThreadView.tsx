"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { firstNameOnly } from "@/lib/displayName";

interface ThreadMessage {
  id: string;
  body: string;
  senderId: string;
  sender: { name: string };
  createdAt: string;
}

export default function ThreadView({
  matchId,
  currentMemberId,
  initialMessages,
}: {
  matchId: string;
  currentMemberId: string;
  initialMessages: ThreadMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const res = await fetch(`/api/threads/${matchId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      setMessages((m) => [...m, data.message]);
      setBody("");
      router.refresh();
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg mt-3">
      <div className="max-h-72 overflow-y-auto p-3 space-y-2 bg-gray-50 rounded-t-lg">
        {messages.length === 0 && <p className="text-sm text-gray-400">No messages yet — say hello!</p>}
        {messages.map((m) => {
          const mine = m.senderId === currentMemberId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  mine ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                {!mine && <p className="text-xs font-medium mb-0.5 opacity-70">{firstNameOnly(m.sender.name)}</p>}
                {m.body}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 p-2 border-t border-gray-200">
        <input
          className="input flex-1"
          placeholder="Write a message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={sending}
        />
        <button type="submit" className="btn-primary" disabled={sending}>
          Send
        </button>
      </form>
    </div>
  );
}
