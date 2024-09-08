import type { PlasmoMessaging } from "@plasmohq/messaging"

import { clearAllEmbeddings } from "~services/indexedDB"

const clearEmbeddings: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("Clearing embeddings")
    await clearAllEmbeddings()
    res.send({ success: true })
  } catch (error) {
    console.error("Error clearing embeddings:", error)
    res.send({ success: false, error: error.message })
  }
}

export default clearEmbeddings
