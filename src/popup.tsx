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

const Popup: React.FC = () => {
  const [chatVisible, setChatVisible] = useStorage("chatVisible", false)
  const [config, setConfig] = useStorage("config", {
    apiKey: "",
    baseURL: defaultConfig.DEFAULT_API_ENDPOINT,
    model: defaultConfig.DEFAULT_MODEL,
    embeddingModel: defaultConfig.DEFAULT_EMBEDDING_MODEL,
    embeddingEndpoint: defaultConfig.DEFAULT_EMBEDDING_ENDPOINT
  })

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfig({ ...config, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                name="apiKey"
                type="text"
                placeholder="Ingrese su API Key"
                autoComplete="off"
                value={config.apiKey}
                onChange={handleConfigChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint</Label>
              <Input
                id="endpoint"
                name="baseURL"
                type="url"
                placeholder="https://api.example.com"
                autoComplete="off"
                value={config.baseURL}
                onChange={handleConfigChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                placeholder="Nombre del modelo"
                autoComplete="off"
                value={config.model}
                onChange={handleConfigChange}
              />
            </div>
          </TabsContent>
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="embeddingModel">Embedding Model</Label>
              <Input
                id="embeddingModel"
                name="embeddingModel"
                placeholder="Nombre del embedding model"
                autoComplete="off"
                value={
                  config.embeddingModel || defaultConfig.DEFAULT_EMBEDDING_MODEL
                }
                onChange={handleConfigChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="embeddingEndpoint">Embedding Endpoint</Label>
              <Input
                id="embeddingEndpoint"
                name="embeddingEndpoint"
                type="url"
                placeholder="https://embedding.api.example.com"
                autoComplete="off"
                value={
                  config.embeddingEndpoint ||
                  defaultConfig.DEFAULT_EMBEDDING_ENDPOINT
                }
                onChange={handleConfigChange}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmit}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </CardFooter>
    </Card>
  )
}

export default Popup
