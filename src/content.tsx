import { AnimatePresence, motion } from "framer-motion"
import type { PlasmoCSConfig } from "plasmo"
import React, { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import "~style.css"

import cssText from "data-text:~style.css"
import type { MemoryVectorStore } from "langchain/vectorstores/memory"
import { MessageCircle } from "lucide-react"

import ChatUI from "~components/FloatingChat"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
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
            className="fixed bottom-20 right-4 w-80 h-[500px] shadow-lg bg-white/80 backdrop-blur-md border border-gray-200 rounded-lg overflow-hidden">
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
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          rotate: isOpen ? 180 : 0
        }}>
        <MessageCircle className="h-6 w-6" />
      </motion.button>
    </>
  )
}

export default FloatingChat
