import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// pdf-parse is CommonJS
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { text } = await pdfParse(buffer);
  return (text ?? "").trim();
}
