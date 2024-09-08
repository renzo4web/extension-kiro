import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import "~style.css"

import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ChatOpenAI, OpenAI, OpenAIEmbeddings } from "@langchain/openai"
import cssText from "data-text:~style.css"
import { createStuffDocumentsChain } from "langchain/chains/combine_documents"
import { Document } from "langchain/document"
import { pull } from "langchain/hub"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MemoryVectorStore } from "langchain/vectorstores/memory"

import { answerQuestion, extractContent } from "~services/ai"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = React.useState<any[]>([])
  const [chatVisible] = useStorage("chatVisible", false)
  const [config] = useStorage("config", {
    apiKey: "",
    baseURL: "",
    model: ""
  })
  const [loadingResponse, setLoadingResponse] = React.useState(false)
  const [loadingProcessDocument, setLoadingProcessDocument] =
    React.useState(false)
  const [vectorStore, setVectorStore] =
    React.useState<MemoryVectorStore | null>(null)

  const toggleChat = () => setIsOpen(!isOpen)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const question = (e.target as HTMLFormElement)?.question?.value || ""

    if (!question || !vectorStore) {
      console.log(
        "[handleSubmit] question is empty or no vector store available"
      )
      return
    }

    setLoadingResponse(true)

    try {
      setMessages((messages: any) => [
        ...messages,
        { role: "user", content: question }
      ])
      console.log("[handleSubmit] config", config)
      const answer = await answerQuestion(vectorStore, question, {
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        model: config.model
      })
      setMessages((messages: any) => [
        ...messages,
        { role: "assistant", content: answer }
      ])
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.log("[handleSubmit] error", error)
    } finally {
      setLoadingResponse(false)
    }
  }

  const processDocument = async () => {
    try {
      setLoadingProcessDocument(true)
      const newVectorStore = await extractContent()

      setVectorStore(newVectorStore)
    } catch (error) {
      console.log("[processDocument] error", error)
    } finally {
      setLoadingProcessDocument(false)
    }
  }

  console.log("[conteont] chatVisible", chatVisible)
  if (!chatVisible) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 plasmo-bg-red-500 p-5">
      {isOpen ? (
        <div className="w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col">
          <button
            onClick={toggleChat}
            className="self-end p-2 text-gray-500 hover:text-gray-700">
            X
          </button>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((message: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-100 text-right"
                    : "bg-green-100"
                }`}>
                <p className="font-bold mb-1">
                  {message.role === "user" ? "You" : "Assistant"}
                </p>
                <p>{message.content}</p>
              </div>
            ))}
          </div>
          {loadingProcessDocument && (
            <div className="p-4 border-t border-gray-200">
              <p>Procesando documento...</p>
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                name="question"
                placeholder="Haz una pregunta..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {loadingResponse ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
          <button
            onClick={processDocument}
            className="m-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
            Extraer contenido
          </button>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Abrir Chat 👋
        </button>
      )}
    </div>
  )
}

export default FloatingChat
