import { FileText, Loader2, Send, XCircleIcon } from "lucide-react"

import "~style.css"

import type { MemoryVectorStore } from "langchain/vectorstores/memory"
import { useEffect, useRef, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { Button } from "~components/ui/button"
import { Card, CardContent, CardHeader } from "~components/ui/card"
import { Input } from "~components/ui/input"
import { ScrollArea } from "~components/ui/scroll-area"
import type { Message } from "~content"
import { defaultConfigValues } from "~popup"
import { answerQuestion, extractContent } from "~services/ai"

interface ChatUIProps {
  handleClose: () => void
  vectorStore: MemoryVectorStore | null
  setVectorStore: (vectorStore: MemoryVectorStore | null) => void
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

export default function ChatUI({
  handleClose,
  vectorStore,
  setVectorStore,
  messages,
  setMessages
}: ChatUIProps) {
  const [loadingResponse, setLoadingResponse] = useState(false)
  const [loadingProcessDocument, setLoadingProcessDocument] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const [config] = useStorage("config", defaultConfigValues)
  const [currentUrl, setCurrentUrl] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  useEffect(() => {
    const loadExistingVectorStore = async () => {
      if (currentUrl && !!config?.apiKey && !vectorStore) {
        setLoadingProcessDocument(true)
        try {
          if (!!vectorStore) {
            return
          }
          const existingVectorStore = await extractContent()
          if (existingVectorStore) {
            setVectorStore(existingVectorStore)
          }
        } catch (error) {
          console.error("Error loading existing vector store:", error)
          setError(String(error))
        } finally {
          setLoadingProcessDocument(false)
        }
      } else {
        console.log("[useEffect] vectorStore already loaded")
      }
    }

    loadExistingVectorStore()
  }, [currentUrl, config])

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
    setError(null) // Limpiar error anterior

    try {
      setMessages((prevMessages: Message[]) => [
        ...prevMessages,
        { role: "user", content: question }
      ])
      const answer = await answerQuestion(vectorStore, question, {
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        model: config.model,
        maxTokens: config.maxTokens || 100 // Add this line, use default if not set
      })
      setMessages((messages: Message[]) => [
        ...messages,
        { role: "assistant", content: answer }
      ])
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.log("[handleSubmit] error", error)
      setError(String(error))
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
      console.error("[processDocument] error", error)
    } finally {
      setLoadingProcessDocument(false)
    }
  }

  useEffect(() => {
    if (lastMessageRef.current) {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-4 border-b border-gray-200 flex flex-row items-center justify-between">
        <h2 className="text-md text-left self-end font-semibold  text-gray-800">
          Kiro AI Assistant ⚡
        </h2>
        <Button variant="outline" size="icon" onClick={handleClose}>
          <XCircleIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      {!config?.apiKey && (
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-800">Error</p>
          <p className="text-sm text-gray-800">
            Please configure the OpenAI API key, base URL, and model in the
            extension settings.
          </p>
        </div>
      )}
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800">
            <p className="font-semibold mb-1 text-sm">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className={`mb-4 p-3 rounded-lg ${
              message.role === "user" ? "bg-gray-100 ml-8" : "bg-blue-100 mr-8"
            }`}>
            <p className="font-semibold mb-1 text-sm text-gray-700">
              {message.role === "user" ? "You" : "Assistant"}
            </p>
            <p className="text-sm text-gray-800">{message.content}</p>
          </div>
        ))}
      </ScrollArea>
      <CardContent className="p-4 border-t border-gray-200">
        {!!vectorStore ? (
          <Button
            onClick={processDocument}
            className="w-full mb-4 bg-gray-100 text-gray-800 hover:bg-gray-200"
            disabled={loadingProcessDocument}>
            {loadingProcessDocument ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {loadingProcessDocument ? "Indexing..." : "Re-index Page"}
          </Button>
        ) : (
          <Button
            onClick={processDocument}
            className="w-full mb-4 bg-gray-100 text-gray-800 hover:bg-gray-200"
            disabled={loadingProcessDocument}>
            {loadingProcessDocument ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            {loadingProcessDocument ? "Indexing..." : "Index Page"}
          </Button>
        )}
        <div className="flex ">
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              type="text"
              placeholder="Ask a question..."
              name="question"
              className="flex-grow bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
              autoComplete="off"
              disabled={
                !config.apiKey ||
                !config.model ||
                loadingProcessDocument ||
                loadingResponse
              }
              onKeyDown={handleKeyDown}
            />
            <Button
              type="submit"
              className="bg-gray-800 text-white hover:bg-gray-700"
              disabled={loadingResponse}>
              {loadingResponse ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
