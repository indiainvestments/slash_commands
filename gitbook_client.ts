interface GitbookClientOptions {
  version?: "v1";
  spaceId: string;
  gitbookApiUrl: string;
}

interface GitbookSearchSection {
  key: string;
  title: string;
  content: string;
  url: string;
}

interface GitbookSearchNode {
  uid: string;
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

const META = [
  // Contribution Section
  '-MUT44m0zGXuCi0rUs28',
  '-MXftqWR-46qRerHYbX1',
  '-MWrp0wRPkhCuGQnrLK3',
  '-MVfORXYJJA8ZqJKpZ91',
  '-MVget5RMt31IiGdVo10',
  '-MUhXHTdifsuHV9ZkCaI',
  '-MVghkRhRWonKF13-sEC',
  '-MUq-yQFrhl_089eEZs4',
  '-MVgolonv89L-NxZeNOw',
  '-MWJfveO8bGBov2VZ_r2',
  // Disclaimers and Disclosures
  '-MVk5ZMXrwmANrFFxtgG'
].reduce((map, uid) => {
  map[uid] = 0.5;
  return map;
}, {} as Record<string, number>);

const WEIGHTS: Record<string, number> = {
  '-MUEnNPwNxmH8dSZmQfX': 0.6, // Introduction
  ...META, // Meta links with weightage of 0.5
};

export class GitbookSpaceClient {
  public apiUrl: string;
  public spaceId: string;
  public headers: Headers;
  public version: string;
  public iiGitbookBaseUrl: string = 'https://indiainvestments.gitbook.io/content';
  constructor(
    token: string,
    { spaceId, gitbookApiUrl, version }: GitbookClientOptions,
  ) {
    this.spaceId = spaceId;
    // trim forward slash
    this.apiUrl = gitbookApiUrl.endsWith("/")
      ? gitbookApiUrl.slice(0, -1)
      : gitbookApiUrl;
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
      this.apiUrl,
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
        url: `${this.iiGitbookBaseUrl}/${item.url}`,
        path: item.url
      };
    }).sort((a, b) => {
      const weightA = WEIGHTS[a.uid] ?? 1.0;
      const weightB = WEIGHTS[b.uid] ?? 1.0;
      return weightB - weightA;
    });
  }

  async list(query: string, variant = "main") {
    const searchSpace = await this.searchSpace(query);
    const [main] = searchSpace;
    if (!main) {
      throw new Error(`No results found for query: ${query}`);
    }
    const content: GitbookPage = await this.get(
      `content/v/${variant}/url/${main.path}`,
    );
    return {
      title: content.title,
      description: content.description,
      url: main.url,
      items: (content.pages ?? []).map((page) => {
        return {
          title: page.title,
          description: page.description,
          url: `${main.url}/${page.path}`,
        };
      }),
    };
  }
}
