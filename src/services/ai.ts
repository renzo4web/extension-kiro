//@ts-ignore
import { StringOutputParser } from "@langchain/core/output_parsers"
//@ts-ignore
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { createStuffDocumentsChain } from "langchain/chains/combine_documents"
import { Document } from "langchain/document"
import { pull } from "langchain/hub"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MemoryVectorStore } from "langchain/vectorstores/memory"

import { Storage } from "@plasmohq/storage"

import type { Config } from "~popup"

import defaultConfig from "./default-config"
import { getEmbeddings, saveEmbeddings } from "./indexedDB"

export async function getEmbeddingModel() {
  const storage = new Storage()
  const config = await storage.get<Config>("config")

  return {
    apiKey:
      config?.embeddingApiKey ||
      config?.apiKey ||
      defaultConfig?.DEFAULT_EMBEDDING_API_KEY,
    model: config?.embeddingModel || defaultConfig?.DEFAULT_EMBEDDING_MODEL,
    configuration: {
      baseURL:
        config?.embeddingEndpoint || defaultConfig?.DEFAULT_EMBEDDING_ENDPOINT
    }
  }
}

export async function extractContent() {
  const url = window.location.href
  const existingVectorStore = await getEmbeddings(url)

  if (existingVectorStore) {
    console.log("[extractContent] Already have embeddings for:", url)
    return existingVectorStore
  }

  const body = document.body
  const range = document.createRange()
  range.selectNodeContents(body)
  const selection = window?.getSelection?.()
  if (!selection) {
    console.log("no selection")
    return
  }
  selection.removeAllRanges()
  selection.addRange(range)

  const extractedText = selection.toString().trim()
  selection.removeAllRanges()
  const trimmedText = extractedText
    .replace(/^\s+|\s+$/gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim()

  const doc = new Document({ pageContent: trimmedText })
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000
  })
  const docs = await textSplitter.splitDocuments([doc])

  const embeddingModelConfig = await getEmbeddingModel()
  console.log("[extractContent] calling openai embeddings")
  const embeddings = new OpenAIEmbeddings(embeddingModelConfig)

  const newVectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings)

  // Guardar los nuevos embeddings
  await saveEmbeddings(url, newVectorStore)

  return newVectorStore
}

export async function answerQuestion(
  vectorStore: MemoryVectorStore,
  question: string,
  configllm: {
    apiKey: string
    baseURL: string
    model: string
  }
) {
  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt")

  const llm = new ChatOpenAI({
    model: configllm.model,
    temperature: 0,
    apiKey: configllm.apiKey,
    maxTokens: 100,
    configuration: {
      baseURL: configllm.baseURL || undefined
    }
  })

  const retriever = vectorStore.asRetriever()
  const ragChain = await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser: new StringOutputParser()
  })

  const response = await ragChain.invoke({
    context: await retriever.invoke(question),
    question,
    instructions:
      "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise."
  })

  console.log(response)

  return response
}
