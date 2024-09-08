import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ChatOpenAI, OpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { createStuffDocumentsChain } from "langchain/chains/combine_documents"
import { Document } from "langchain/document"
import { pull } from "langchain/hub"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MemoryVectorStore } from "langchain/vectorstores/memory"

export async function extractContent() {
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

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.PLASMO_PUBLIC_OPENAI_API_KEY,
    model: "text-embedding-3-small"
  })

  const newVectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings)

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
    // model: "gpt-4o-mini",
    model: configllm.model,
    temperature: 0,
    apiKey: configllm.apiKey,
    maxTokens: 100, // Limitar la longitud de la respuesta
    configuration: {
      baseURL: configllm.baseURL || undefined
    }
  })

  // const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
  // Retrieve and generate using the relevant snippets of the blog.
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
