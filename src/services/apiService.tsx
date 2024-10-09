import { AssemblyAI } from "assemblyai";
import axios from "axios";

const assemblyApiKey: string = "YOUR_ASSEMBLY_API_KEY_PASTE_HERE";
export const client = new AssemblyAI({
  apiKey: assemblyApiKey,
});

export const assembly_API = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: assemblyApiKey,
    "Content-Type": "application/octet-stream",
  },
});
