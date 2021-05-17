import {GitbookSpaceClient} from './gitbook_client.ts';
import { GitbookPage } from "./types/index.d.ts";
// Yields random bright colors which should look good on discord.
export function* randomHexColorGen(): Generator<string> {
  while (true) {
    const hex = [
      "ff",
      ...Array(4)
        .fill(0)
        .map(() => Math.floor(Math.random() * 15).toString(16)),
    ]
      .sort(() => Math.random() - 0.5)
      .join("");
    yield `#${hex}`;
  }
}

// Naively implemented array chunker.
export function chunk<T>(arr: T[], k: number) {
  const chunks: T[][] = [];
  for (let idx = 0; idx < arr.length; idx += k) {
    chunks.push(arr.slice(idx, idx + k));
  }
  return chunks;
}

export async function fetchAndSave(list: GitbookPage[], results: any[], client: GitbookSpaceClient) {
  for (const res of results) {
      const data = await client.fetchContentOfPage(res.path);
      list.push(data);
  }
}