const path = require("path");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { Pinecone } = require("@pinecone-database/pinecone");
const { PineconeStore } = require("@langchain/pinecone");
const { loadMetadataMap, saveMetadataMap } = require("./metadataUtil");

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
});

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const PINECONE_INDEX_NAME = "first-project";

async function getVectorStore(filePath) {
  const sourceName = path.basename(filePath);
  const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);
  const loader = new TextLoader(filePath);
  const metadataMap = await loadMetadataMap();

  if (metadataMap[sourceName]) {
    return new PineconeStore(embeddings, { pineconeIndex, namespace: sourceName });
  }

  const docs = await loader.load();
  docs.forEach((doc) => (doc.metadata = { source: sourceName }));

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const splitDocs = await textSplitter.splitDocuments(docs);
  const vectorStore = await PineconeStore.fromDocuments(splitDocs, embeddings, {
    pineconeIndex,
    namespace: sourceName,
  });

  metadataMap[sourceName] = {
    uploadedAt: new Date().toISOString(),
    chunks: splitDocs.length,
  };
  await saveMetadataMap(metadataMap);

  return vectorStore;
}

module.exports = getVectorStore;
