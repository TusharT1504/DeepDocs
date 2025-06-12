const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { RunnableSequence, RunnablePassthrough } = require("@langchain/core/runnables");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { formatDocumentsAsString } = require("langchain/util/document");
const getVectorStore = require("./vectorStore");

const RAG_PROMPT_TEMPLATE = `
  You are a helpful assistant. Use the following pieces of context to answer the question at the end.
  If you don't know the answer, just say that you don't know, don't try to make up an answer.

  Context:
  {context}

  Question: {question}

  Helpful Answer:
`;

async function runRAG(userQuestion) {
  const vectorStore = await getVectorStore("./documents/sample.txt");
  const retriever = vectorStore.asRetriever();

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.3,
    maxOutputTokens: 500,
  });

  const ragPrompt = PromptTemplate.fromTemplate(RAG_PROMPT_TEMPLATE);

  const ragChain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocumentsAsString),
      question: new RunnablePassthrough(),
    },
    ragPrompt,
    model,
    new StringOutputParser(),
  ]);

  return await ragChain.invoke(userQuestion);
}

module.exports = runRAG;
