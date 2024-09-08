import { OpenAIEmbeddings } from "@langchain/openai"
import { MemoryVectorStore } from "langchain/vectorstores/memory"

const DB_NAME = "EmbeddingsDB"
const STORE_NAME = "embeddings"

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      db.createObjectStore(STORE_NAME, { keyPath: "url" })
    }
  })
}

export async function saveEmbeddings(
  url: string,
  vectorStore: MemoryVectorStore
): Promise<void> {
  const db = await openDB()
  const transaction = db.transaction(STORE_NAME, "readwrite")
  const store = transaction.objectStore(STORE_NAME)

  const serializedData = {
    vectors: vectorStore.memoryVectors
  }

  return new Promise((resolve, reject) => {
    const request = store.put({ url, vectorStore: serializedData })
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getEmbeddings(
  url: string
): Promise<MemoryVectorStore | null> {
  const db = await openDB()
  const transaction = db.transaction(STORE_NAME, "readonly")
  const store = transaction.objectStore(STORE_NAME)

  console.log("[getEmbeddings] url", url)

  return new Promise((resolve, reject) => {
    const request = store.get(url)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      if (request.result) {
        const { vectors } = request.result.vectorStore
        // No llamamos a OpenAIEmbeddings aquí
        const vectorStore = new MemoryVectorStore(
          new OpenAIEmbeddings({
            apiKey: process.env.PLASMO_PUBLIC_OPENAI_API_KEY,
            model: "text-embedding-3-small"
          })
        )
        vectorStore.memoryVectors = vectors
        resolve(vectorStore)
      } else {
        resolve(null)
      }
    }
  })
}
