import React, { useEffect, useState } from "react"

import "~style.css"

import cssText from "data-text:~style.css"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  const toggleChat = () => setIsOpen(!isOpen)

  const extractContent = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getPageContent" },
        (response) => {
          if (response && response.content) {
            setMessages([
              ...messages,
              `Contenido extraído: ${response.content.substring(0, 100)}...`
            ])
          }
        }
      )
    })
  }

  useEffect(() => {
    // Escuchar mensajes del popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "toggleVisibility") {
        setIsVisible(request.isVisible)
        sendResponse({ success: true })
      }
    })

    // // Verificar el estado inicial
    // chrome.storage.local.get(["chatVisible"], (result) => {
    //   setIsVisible(result.chatVisible || false)
    // })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      setMessages([...messages, `Usuario: ${input}`])
      // Aquí irá la lógica para procesar la pregunta y obtener una respuesta
      setInput("")
    }
  }

  if (!isVisible) return null

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
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Haz una pregunta..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Enviar
              </button>
            </div>
          </form>
          <button
            onClick={extractContent}
            className="m-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
            Extraer contenido
          </button>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Abrir Chat
        </button>
      )}
    </div>
  )
}

export default FloatingChat
