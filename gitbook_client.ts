interface GitbookClientOptions {
  version?: "v1";
  spaceId: string;
  gitbookUrl: string;
}

interface GitbookSearchSection {
  key: string;
  title: string;
  content: string;
  url: string;
}

interface GitbookSearchNode {
  id: string;
  title: string;
  sections: GitbookSearchSection[];
  url: string;
  path: string;
}

interface GitbookSpace {
  uid: string;
  name: string;
  baseName: string;
  private: boolean;
  unlisted: boolean;
}

interface GitbookVariant {
  uid: string;
  ref: string;
  title: string;
  page: GitbookPage;
}

interface GitbookAsset {
  uid: string;
  name: string;
  downloadURL: string;
  contentType: "image/png" | `${string}/${string}`;
}

interface GitbookPage {
  uid: string;
  title: string;
  description: string;
  kind: "document" | "group";
  path: string;
  pages: GitbookPage[] | never;
}

interface GitbookContent {
  uid: string;
  parents: string[];
  variants: GitbookVariant[];
  assets: GitbookAsset[];
}

const weights: Record<string, number> = {}; // { [pageId]: weight } where 0 <= weight <= 1

export class GitbookSpaceClient {
  public gitbookUrl: string;
  public ApiUrl: string;
  public spaceId: string;
  public headers: Headers;
  public version: string;
  constructor(
    token: string,
    { spaceId, gitbookUrl, version }: GitbookClientOptions,
  ) {
    this.ApiUrl = "https://api-beta.gitbook.com";
    this.spaceId = spaceId;
    // trim forward slash
    this.gitbookUrl = gitbookUrl.endsWith("/")
      ? gitbookUrl.slice(0, -1)
      : gitbookUrl;
    this.version = version ?? "v1";
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${token}`);
    this.headers = headers;
  }

  getSpaceUrl(path = "/", params?: URLSearchParams) {
    // trim beginning slash
    const rest = path.startsWith("/") ? path.slice(1, path.length) : path;
    const url = new URL(
      `${this.version}/spaces/${this.spaceId}/${rest}`,
      this.ApiUrl,
    );
    if (params) {
      url.search = params.toString();
    }
    return url;
  }

  async get(path = "/", params?: URLSearchParams) {
    const url = this.getSpaceUrl(path, params);
    const response = await fetch(url, { headers: this.headers });
    return response.json();
  }

  getSpace(): Promise<GitbookSpace> {
    return this.get();
  }

  getRoot(): Promise<GitbookContent> {
    return this.get("content");
  }

  async searchSpace(
    query: string,
  ) {
    const { results } = await this.get(
      "search",
      new URLSearchParams({ query }),
    ) as { results: GitbookSearchNode[] };
    return results.map((item) => {
      return {
        ...item,
        url: `${this.gitbookUrl}/${item.url}`,
        path: item.url
      };
    }).sort((a, b) => {
      const weightA = weights[a.id] ?? 1.0;
      const weightB = weights[b.id] ?? 1.0;
      return weightB - weightA;
    });
  }

  async list(query: string, variant = "main") {
    const [main] = await this.searchSpace(query);
    if (!main) {
      throw new Error(`No results found for query: ${query}`);
    }
    const content: GitbookPage = await this.get(
      `content/v/${variant}/url/${main.path}`,
    );
    return {
      title: content.title,
      description: content.description,
      url: `${this.gitbookUrl}/${main.url}`,
      items: (content.pages ?? []).map((page) => {
        return {
          title: page.title,
          description: page.description,
          url: `${this.gitbookUrl}/${main.url}/${page.path}`,
        };
      }),
    };
  }
}
