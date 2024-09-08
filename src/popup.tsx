import "~style.css"

import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

const Popup: React.FC = () => {
  const [chatVisible, setChatVisible] = useStorage("chatVisible", false)
  const [config, setConfig] = useStorage("config", {
    apiKey: "",
    baseURL: "",
    model: ""
  })

  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowForm(false)
  }

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfig({ ...config, [name]: value })
  }

  return (
    <div className="p-4 w-64">
      <h1 className="text-lg font-bold mb-4">AI Article Assistant</h1>
      <button
        onClick={() => setChatVisible(!chatVisible)}
        className={`w-full py-2 px-4 rounded ${
          chatVisible
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-green-500 hover:bg-green-600 text-white"
        }`}>
        {chatVisible ? "Ocultar Chat" : "Mostrar Chat"}
      </button>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mt-2 w-full py-2 px-4 rounded bg-blue-500 hover:bg-blue-600 text-white">
        Configuración
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="text"
            name="apiKey"
            value={config.apiKey}
            onChange={handleConfigChange}
            placeholder="API Key"
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            name="baseURL"
            value={config.baseURL}
            onChange={handleConfigChange}
            placeholder="URL Base"
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            name="model"
            value={config.model}
            onChange={handleConfigChange}
            placeholder="Nombre del Modelo"
            className="w-full mb-2 p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 rounded bg-blue-500 hover:bg-blue-600 text-white">
            Guardar
          </button>
        </form>
      )}
    </div>
  )
}

export default Popup
