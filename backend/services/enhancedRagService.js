const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { RunnableSequence, RunnablePassthrough } = require("@langchain/core/runnables");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { formatDocumentsAsString } = require("langchain/util/document");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { Pinecone } = require("@pinecone-database/pinecone");
const { PineconeStore } = require("@langchain/pinecone");
const { BufferMemory } = require("langchain/memory");
const { ConversationChain } = require("langchain/chains");

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
});

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const PINECONE_INDEX_NAME = "deepdocs";

const RAG_PROMPT_TEMPLATE = `
You are an intelligent AI assistant that helps users understand and interact with their uploaded documents. 
You have access to the following context from the user's documents:

{context}

Use this context to provide accurate, helpful answers to the user's questions. 
If the information is not available in the provided context, say so clearly.
Always cite the source document when providing information.

Previous conversation:
{chat_history}

Current question: {question}

Please provide a comprehensive and accurate answer based on the document context:
`;

class EnhancedRAGService {
  constructor() {
    this.memories = new Map(); // Store conversation memories per chat
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0.3,
      maxOutputTokens: 1000,
    });
  }

  async getMemory(chatId) {
    if (!this.memories.has(chatId)) {
      this.memories.set(chatId, new BufferMemory({
        returnMessages: true,
        memoryKey: "chat_history",
        inputKey: "question"
      }));
    }
    return this.memories.get(chatId);
  }

  async getMultiDocumentRetriever(documentNamespaces) {
    const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);
    const retrievers = [];

    for (const namespace of documentNamespaces) {
      try {
        const vectorStore = new PineconeStore(embeddings, {
          pineconeIndex,
          namespace: namespace
        });
        retrievers.push(vectorStore.asRetriever({ k: 5 }));
      } catch (error) {
        console.warn(`Failed to create retriever for namespace ${namespace}:`, error);
      }
    }

    return {
      async getRelevantDocuments(query) {
        const allDocs = [];
        for (const retriever of retrievers) {
          try {
            const docs = await retriever.getRelevantDocuments(query);
            allDocs.push(...docs);
          } catch (error) {
            console.warn('Error retrieving documents:', error);
          }
        }
        
        // Sort by relevance and take top 10
        return allDocs.slice(0, 10);
      }
    };
  }

  async processQuery(chatId, question, documentNamespaces, previousMessages = []) {
    try {
      console.log('EnhancedRAGService.processQuery called with:', { chatId, question, documentNamespaces, previousMessagesCount: previousMessages.length });
      
      // Check if required environment variables are set
      if (!process.env.GOOGLE_API_KEY) {
        console.warn('GOOGLE_API_KEY not set, providing fallback response');
        return {
          answer: "I'm sorry, but I'm currently not able to process your request because the AI service is not properly configured. Please check that the GOOGLE_API_KEY environment variable is set.",
          sources: [],
          context: ""
        };
      }
      
      // Get conversation memory
      const memory = await this.getMemory(chatId);
      console.log('Memory retrieved for chat:', chatId);
      
      // Get relevant documents from all namespaces
      const retriever = await this.getMultiDocumentRetriever(documentNamespaces);
      console.log('Retriever created for namespaces:', documentNamespaces);
      
      const relevantDocs = await retriever.getRelevantDocuments(question);
      console.log('Retrieved documents count:', relevantDocs.length);
      
      // Format context
      const context = formatDocumentsAsString(relevantDocs);
      console.log('Context formatted, length:', context.length);
      
      // Create conversation history
      const chatHistory = previousMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      console.log('Chat history created, length:', chatHistory.length);
      
      // Create RAG chain
      const ragPrompt = PromptTemplate.fromTemplate(RAG_PROMPT_TEMPLATE);
      console.log('RAG prompt template created');
      
      const ragChain = RunnableSequence.from([
        {
          context: () => context,
          chat_history: () => chatHistory,
          question: new RunnablePassthrough(),
        },
        ragPrompt,
        this.model,
        new StringOutputParser(),
      ]);
      console.log('RAG chain created');

      // Generate response
      console.log('Invoking RAG chain with question:', question);
      const response = await ragChain.invoke(question);
      console.log('RAG response generated, length:', response.length);
      
      // Update memory
      await memory.saveContext(
        { question: question },
        { output: response }
      );
      console.log('Memory updated');
      
      // Extract sources
      const sources = relevantDocs.map(doc => ({
        document: doc.metadata.source || doc.metadata.filename,
        page: doc.metadata.page,
        content: doc.pageContent.substring(0, 200) + '...'
      }));
      console.log('Sources extracted, count:', sources.length);
      
      return {
        answer: response,
        sources: sources,
        context: context.substring(0, 500) + '...'
      };
      
    } catch (error) {
      console.error('Error in enhanced RAG service:', error);
      
      // Provide a fallback response if there's an error
      return {
        answer: `I'm sorry, but I encountered an error while processing your request: ${error.message}. Please try again or contact support if the issue persists.`,
        sources: [],
        context: ""
      };
    }
  }

  async clearMemory(chatId) {
    this.memories.delete(chatId);
  }

  async getMemorySummary(chatId) {
    const memory = await this.getMemory(chatId);
    const history = await memory.loadMemoryVariables({});
    return history.chat_history || [];
  }
}

module.exports = new EnhancedRAGService(); 