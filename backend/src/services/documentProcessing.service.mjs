import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { PDFLoader } from
  "@langchain/community/document_loaders/fs/pdf";

import { DocxLoader } from
  "@langchain/community/document_loaders/fs/docx";

import { TextLoader } from
  "@langchain/classic/document_loaders/fs/text";

import { RecursiveCharacterTextSplitter } from
  "@langchain/textsplitters";

async function loadAndSplit(filePath, fileType) {
  let loader;

  if (fileType === "pdf") {
    loader = new PDFLoader(filePath);
  } else if (fileType === "docx") {
    loader = new DocxLoader(filePath);
  } else if (fileType === "txt") {
    loader = new TextLoader(filePath);
  } else {
    throw new Error("Unsupported file type");
  }

  const documents = await loader.load();

  const cleanedDocuments = documents
    .map((doc) => ({
      ...doc,
      pageContent: doc.pageContent
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .trim(),
    }))
    .filter((doc) => doc.pageContent.length > 0);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });

  const chunks = await splitter.splitDocuments(
    cleanedDocuments
  );

  const sourceText = cleanedDocuments
    .map((document) => document.pageContent)
    .join("\n");
  const pageNumbers = new Set(
    cleanedDocuments
      .map((document) =>
        document.metadata?.loc?.pageNumber ??
        document.metadata?.pageNumber
      )
      .filter(Number.isInteger)
  );

  return {
    chunks: chunks.map((chunk, index) => ({
      content: chunk.pageContent,
      chunkIndex: index,
      metadata: chunk.metadata,
    })),
    metadata: {
      pageCount: pageNumbers.size || null,
      wordCount: sourceText.match(/\S+/g)?.length || 0,
      characterCount: sourceText.length,
    },
  };
}

export async function extractAndSplit(filePath, fileType) {
  return (await loadAndSplit(filePath, fileType)).chunks;
}

export async function extractAndSplitBuffer(buffer, fileType) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError("Document content must be a Buffer");
  }

  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "enterprise-ai-document-")
  );
  const temporaryFile = path.join(
    temporaryDirectory,
    `source.${fileType}`
  );

  try {
    await writeFile(temporaryFile, buffer, { mode: 0o600, flag: "wx" });
    return await loadAndSplit(temporaryFile, fileType);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}