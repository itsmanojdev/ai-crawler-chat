"use client";

import { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export function ChatProvider({ children }) {
    const [messages, setMessages] = useState([]);

    return (
        <ChatContext.Provider value={{ messages, setMessages }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}
