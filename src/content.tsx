import { AnimatePresence, motion } from "framer-motion"
import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { clearAllEmbeddings } from "~services/indexedDB"

import "~style.css"

import cssText from "data-text:~style.css"
import type { MemoryVectorStore } from "langchain/vectorstores/memory"

import ChatUI from "~components/FloatingChat"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false,
  exclude_matches: [
    "*://*.youtube.com/*",
    "*://*.instagram.com/*",
    "*://*.facebook.com/*",
    "*://*.twitter.com/*",
    "*://*.linkedin.com/*",
    "*://*.reddit.com/*",
    "*://*.pinterest.com/*",
    "*://*.tiktok.com/*",
    "*://*.twitch.tv/*",
    "*://*.discord.com/*",
    "*://*.github.com/*",
    "*://*.stackoverflow.com/*",
    "*://*.quora.com/*",
    "*://chatgpt.com/*"
    // Add more sites as needed
  ]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export interface Message {
  role: "user" | "assistant"
  content: string
}

const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [chatVisible] = useStorage("chatVisible", false)
  const [vectorStore, setVectorStore] = useState<MemoryVectorStore | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  const toggleChat = () => setIsOpen(!isOpen)

  useEffect(() => {
    const messageListener = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.action === "clearEmbeddings") {
        clearAllEmbeddings()
          .then(() => {
            console.log("Embeddings cleared successfully")
            sendResponse({ success: true })
          })
          .catch((error) => {
            console.error("Error clearing embeddings:", error)
            sendResponse({ success: false, error: error.message })
          })
        return true // Indicates that the response is sent asynchronously
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  if (!chatVisible) return null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-4 w-96 h-[500px] shadow-lg bg-white/80 backdrop-blur-md border border-gray-200 rounded-lg overflow-hidden">
            <ChatUI
              handleClose={toggleChat}
              vectorStore={vectorStore}
              setVectorStore={setVectorStore}
              messages={messages}
              setMessages={setMessages}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gray-300 text-white shadow-lg flex items-center justify-center hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { scale: 1.2 } : { scale: 1 }}
        transition={{ duration: 0.3 }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="#0000"
          className={`h-6 w-6 transition-transform ${isOpen ? "rotate-45" : ""}`}>
          <path
            stroke="currentColor"
            fill="#0000"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            className="stroke-gray-800"
            d="M5.75 10C10 10 10 5.75 10 5.75S10 10 14.25 10C10 10 10 14.25 10 14.25S10 5.75 5.75 10ZM4 1.75S4 4 1.75 4C4 4 4 6.25 4 6.25S4 4 6.25 4C4 4 4 1.75 4 1.75Z"
          />
        </svg>
      </motion.button>
    </>
  )
}

export default FloatingChat
