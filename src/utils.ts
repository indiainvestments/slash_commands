import { PathWeight } from "./types/index.d.ts";

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

export function getWeightOfPath(path: string, weights: PathWeight[]) {
  const searchPath = path.startsWith("/") ? path.slice(1) : path;
  const pathValue = weights.find((val, _) => {
    const valPath = val.path;
    return searchPath.match(
      new RegExp(`^${valPath.startsWith("/") ? valPath.slice(1) : valPath}$`),
    );
  });
  return pathValue?.weight ?? 1.0;
}

export function getGitbookSpaceUrl(
  apiUrl: string,
  version: string,
  spaceId: string,
  path = "/",
  params?: URLSearchParams,
) {
  // trim beginning slash
  const rest = path.startsWith("/") ? path.slice(1, path.length) : path;
  const url = new URL(
    `${version}/spaces/${spaceId}/${rest}`,
    apiUrl,
  );
  if (params) {
    url.search = params.toString();
  }
  return url;
}
