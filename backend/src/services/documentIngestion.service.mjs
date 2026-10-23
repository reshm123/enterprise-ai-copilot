import { OpenAIEmbeddings } from "@langchain/openai";

import DocumentChunk from "../models/documentChunk.model.mjs";
import { extractAndSplitBuffer } from "./documentProcessing.service.mjs";

export async function processDocumentBuffer({ document, buffer }) {
  document.status = "Processing";
  document.processingError = null;
  document.processingAttempts += 1;
  await document.save();

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const { chunks, metadata } = await extractAndSplitBuffer(
      buffer,
      document.fileExtension
    );

    if (chunks.length === 0) {
      throw new Error("No extractable text was found in the document");
    }

    const embeddings = new OpenAIEmbeddings({
      apiKey,
      model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    });
    const vectors = await embeddings.embedDocuments(
      chunks.map((chunk) => chunk.content)
    );

    if (vectors.length !== chunks.length) {
      throw new Error("Embedding response count did not match chunk count");
    }

    await DocumentChunk.bulkWrite(
      chunks.map((chunk, index) => ({
        updateOne: {
          filter: {
            documentId: document._id,
            chunkIndex: chunk.chunkIndex,
          },
          update: {
            $set: {
              content: chunk.content,
              embedding: vectors[index],
              tokenCount: chunk.content.trim().split(/\s+/).length,
              metadata: {
                pageNumber:
                  chunk.metadata?.loc?.pageNumber ??
                  chunk.metadata?.pageNumber ??
                  null,
                section: chunk.metadata?.section ?? null,
                heading: chunk.metadata?.heading ?? null,
              },
            },
          },
          upsert: true,
        },
      })),
      { ordered: true }
    );

    await DocumentChunk.deleteMany({
      documentId: document._id,
      chunkIndex: { $gte: chunks.length },
    });

    document.status = "Completed";
    document.processingError = null;
    document.processedAt = new Date();
    document.chunkCount = chunks.length;
    document.metadata = metadata;
    await document.save();

    return { document, error: null };
  } catch (error) {
    console.error("[document-processing-error]", {
      documentId: document._id.toString(),
      fileType: document.fileExtension,
      processingAttempt: document.processingAttempts,
      errorName: error.name,
      errorCode: error.code,
      message: error.message,
      httpStatus: error.status,
      requestId: error.request_id,
    });
    document.status = "Failed";
    document.processingError = error.message.slice(0, 1000);
    await document.save();
    return { document, error };
  }
}

