"use client";

import { useState } from "react";
import WebsiteDropdown from "../Components/ui/WebsiteDropdown";

export default function ChatPage() {
    const [selectedWebsite, setSelectedWebsite] = useState("");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim() || loading || !selectedWebsite) return;

        const userMessage = { role: "user", content: input, website: selectedWebsite };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: input, websiteId: selectedWebsite }),
            });

            const data = await res.json();
            console.log(data);

            const aiMessage = { role: "ai", content: data.response };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            console.error("Chat error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !loading) {
            sendMessage();
        }
    };

    return (
        <div className="w-full flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-md border border-sky-200">
            <div className="text-xl font-semibold text-sky-700">AI Chat Assistant</div>

            <WebsiteDropdown
                selectedWebsite={selectedWebsite}
                onChange={setSelectedWebsite}
            />

            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pt-4 pr-2">
                {messages.map((msg, idx) => (
                    <pre
                        className={`p-3 rounded-xl max-w-[70%] whitespace-pre-wrap break-words ${msg.role === "user"
                            ? "bg-sky-100 self-end text-right"
                            : "bg-sky-200 self-start text-left"
                            }`}
                    >
                        {msg.content}
                    </pre>
                ))}
                {loading && (
                    <div className="text-sky-500 text-sm italic">AI is typing...</div>
                )}
            </div>

            <div className="flex gap-2 items-center mt-4">
                <input
                    type="text"
                    className="flex-1 border border-sky-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading || !selectedWebsite}
                />
                <button
                    className={`px-4 py-2 rounded-xl text-white ${loading || !selectedWebsite
                        ? "bg-sky-300 cursor-not-allowed"
                        : "bg-sky-500 hover:bg-sky-600"
                        }`}
                    onClick={sendMessage}
                    disabled={loading || !selectedWebsite}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
