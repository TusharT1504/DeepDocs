const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { Pinecone } = require("@pinecone-database/pinecone");
const { PineconeStore } = require("@langchain/pinecone");
const { v4: uuidv4 } = require('uuid');

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
});

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const PINECONE_INDEX_NAME = "deepdocs";

class PDFService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '..', 'uploads');
    this.ensureUploadsDir();
  }

  ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async processPDF(file) {
    try {
      const filename = `${uuidv4()}-${file.originalname}`;
      const filePath = path.join(this.uploadsDir, filename);
      
      // Save the file
      fs.writeFileSync(filePath, file.buffer);
      
      // Parse PDF
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      
      // Extract text and metadata
      const text = pdfData.text;
      const pages = pdfData.numpages;
      const info = pdfData.info;
      
      // Create document chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      const chunks = await textSplitter.splitText(text);
      
      // Create documents with metadata
      const documents = chunks.map((chunk, index) => ({
        pageContent: chunk,
        metadata: {
          source: file.originalname,
          filename: filename,
          page: Math.floor(index / (chunks.length / pages)) + 1,
          chunk: index + 1,
          totalChunks: chunks.length,
          title: info.Title || file.originalname,
          author: info.Author || 'Unknown',
          subject: info.Subject || '',
          creator: info.Creator || '',
          producer: info.Producer || '',
          pages: pages
        }
      }));
      
      // Store in Pinecone
      const namespace = `${filename}-${Date.now()}`;
      const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);
      
      await PineconeStore.fromDocuments(documents, embeddings, {
        pineconeIndex,
        namespace: namespace
      });
      
      return {
        filename: filename,
        originalName: file.originalname,
        path: filePath,
        vectorNamespace: namespace,
        pages: pages,
        chunks: chunks.length,
        title: info.Title || file.originalname,
        author: info.Author || 'Unknown',
        size: file.size,
        uploadedAt: new Date()
      };
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }

  async deleteDocument(filename, namespace) {
    try {
      // Delete from Pinecone
      const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);
      await pineconeIndex.namespace(namespace).deleteAll();
      
      // Delete file
      const filePath = path.join(this.uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  async getDocumentInfo(filename) {
    try {
      const filePath = path.join(this.uploadsDir, filename);
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      
      return {
        filename: filename,
        pages: pdfData.numpages,
        info: pdfData.info,
        size: fs.statSync(filePath).size
      };
    } catch (error) {
      console.error('Error getting document info:', error);
      throw new Error(`Failed to get document info: ${error.message}`);
    }
  }
}

module.exports = new PDFService(); 