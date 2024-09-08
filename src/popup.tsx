import React, { useEffect, useState } from "react"

import "~style.css"

import { Eye, EyeOff, Save, Settings } from "lucide-react"

import { useStorage } from "@plasmohq/storage/hook"

import { Button } from "~components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "~components/ui/card"
import { Input } from "~components/ui/input"
import { Label } from "~components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~components/ui/tabs"
import defaultConfig from "~services/default-config"

export interface Config {
  apiKey: string
  baseURL: string
  model: string
  embeddingModel?: string
  embeddingEndpoint?: string
  embeddingApiKey?: string
}

export const defaultConfigValues: Config = {
  apiKey: "",
  baseURL: defaultConfig?.DEFAULT_API_ENDPOINT || "",
  model: defaultConfig?.DEFAULT_MODEL || "",
  embeddingModel: defaultConfig?.DEFAULT_EMBEDDING_MODEL || "",
  embeddingEndpoint: defaultConfig?.DEFAULT_EMBEDDING_ENDPOINT || "",
  embeddingApiKey: defaultConfig?.DEFAULT_EMBEDDING_API_KEY || ""
}

const Popup: React.FC = () => {
  const [chatVisible, setChatVisible] = useStorage("chatVisible", false)
  const [config, setConfig] = useStorage<Config>("config", defaultConfigValues)
  const [configFormValues, setConfigFormValues] =
    useState<Config>(defaultConfigValues)

  useEffect(() => {
    if (config) {
      setConfigFormValues(config)
    }
  }, [config])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfigFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setConfig(configFormValues)
  }

  const toggleChat = () => {
    setChatVisible(!chatVisible)
  }

  return (
    <Card className="w-96 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="text-2xl font-bold text-center">
          AI Article Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={toggleChat}>
            {chatVisible ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Ocultar Chat
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Mostrar Chat
              </>
            )}
          </Button>
        </div>
        <form className="w-full" onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">
                <Settings className="w-4 h-4 mr-2" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Settings className="w-4 h-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key *</Label>
                <Input
                  id="apiKey"
                  name="apiKey"
                  type="text"
                  placeholder="Ingrese su API Key"
                  autoComplete="off"
                  value={configFormValues.apiKey}
                  onChange={handleInputChange}
                />
              </div>
              <p className="text-gray-400">
                Do not change the below values if you want to use OpenAI
              </p>
              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint</Label>
                <Input
                  id="endpoint"
                  name="baseURL"
                  type="url"
                  placeholder={"https://api.openai.com"}
                  autoComplete="off"
                  value={configFormValues.baseURL}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  placeholder="Nombre del modelo"
                  autoComplete="off"
                  value={configFormValues.model}
                  onChange={handleInputChange}
                />
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <p className="text-gray-400">
                Do not change if you want OpenAI embedding model
              </p>
              <div className="space-y-2">
                <Label htmlFor="embeddingModel">Embedding Model</Label>
                <Input
                  id="embeddingModel"
                  name="embeddingModel"
                  placeholder="text-embedding-3-small"
                  autoComplete="off"
                  value={configFormValues.embeddingModel}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="embeddingEndpoint">Embedding Endpoint</Label>
                </div>
                <Input
                  id="embeddingEndpoint"
                  name="embeddingEndpoint"
                  type="url"
                  placeholder="https://api.openai.com/v1/embeddings"
                  autoComplete="off"
                  value={configFormValues.embeddingEndpoint}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="embeddingApiKey">Embedding API Key</Label>
                  <p className="text-gray-400">Default to chat API Key</p>
                </div>
                <Input
                  id="embeddingApiKey"
                  name="embeddingApiKey"
                  type="password"
                  placeholder="Ingrese su API Key para el modelo de embedding"
                  autoComplete="off"
                  value={configFormValues.embeddingApiKey}
                  onChange={handleInputChange}
                />
              </div>
            </TabsContent>
          </Tabs>
          <CardFooter className="mt-4 w-full">
            <Button type="submit" className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export default Popup
