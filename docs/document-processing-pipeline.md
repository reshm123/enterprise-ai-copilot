# Document Processing Pipeline

## Flow

1. Multer validates the upload type and 10 MB size limit, then keeps the file in memory.
2. The API calculates a SHA-256 hash of the original bytes.
3. MongoDB is checked for a non-deleted document with that hash. If found, the API returns the existing document with `duplicate: true` and does not upload or embed the bytes again.
4. A new document is reserved with a unique content hash, then the original file is uploaded to the configured S3 bucket.
5. The file is temporarily written to a restricted OS temp directory. LangChain's PDF, DOCX, or text loader extracts text; the temp directory is removed in a `finally` block.
6. Text is normalized and split with `RecursiveCharacterTextSplitter` using 1,000-character chunks and 150-character overlap.
7. LangChain `OpenAIEmbeddings` generates a vector for each chunk.
8. Chunks, vectors, token estimates, and source metadata are upserted into MongoDB's `documentchunks` collection. The parent document stores the content hash, chunk count, source statistics, and processing status.

## Status and Retry

New documents move through `Processing` to `Completed`. Extraction or embedding errors are saved in `processingError` and set the status to `Failed`; the uploaded S3 object is retained. The Admin-only retry endpoint reloads the S3 object and reruns the pipeline. Existing local documents can still be retried from their saved local path.

Changing a file's bytes changes its SHA-256 hash and causes a new ingestion. Soft-deleted documents do not block a later upload of the same content. MongoDB's partial unique index on `contentHash` prevents concurrent duplicate reservations; the server creates document indexes after connecting to MongoDB and before listening for requests.

## Configuration

Set these variables in the backend environment:

```dotenv
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
OPENAI_API_KEY=your-openai-api-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

AWS authentication uses the standard AWS SDK credential chain (environment credentials, a configured profile, or an IAM role). Do not commit real AWS credentials or OpenAI keys. See `backend/.env.example` for the safe template.

## Collections

- `documents` stores the original file's S3 key, SHA-256 hash, source metadata, uploader, and pipeline status.
- `documentchunks` stores each chunk's text, embedding vector, chunk index, and loader metadata.

The embedding array is persisted for retrieval. A MongoDB Atlas Vector Search index is needed if vector similarity queries are added.