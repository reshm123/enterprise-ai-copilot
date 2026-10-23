import { createHash } from "node:crypto";

export function generateFileHash(buffer) {
  return createHash("sha256")
    .update(buffer)
    .digest("hex");
}