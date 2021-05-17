import { GitbookSpaceClient } from "../gitbook_client.ts";
import { GitbookContent, GitbookPage } from "../types/index.d.ts";

export class Cache {
  private data: Record<string, string> = {};
  private client: GitbookSpaceClient;
  constructor(client: GitbookSpaceClient) {
    this.client = client;
    this.setUpTimer();
  }
  
  public fillData = async () => {
    const bookContent: GitbookContent = await this.client.get('content');
    const page: GitbookPage = bookContent.variants[0].page;
    this.fillCacheRecursively(page);
  }

  private setUpTimer = () => {
    setInterval(async () => {
      console.log("refreshing cache");
      await this.fillData();
    }, 60 * 60 * 1000);
  }

  public getValue(path: string) {
    return this.data[path];
  }

  private fillCacheRecursively = (page: GitbookPage) => {
    this.data[page.uid] = page.description;
    if (page.pages.length === 0) return;
    for (const pg of page.pages) {
      this.fillCacheRecursively(pg);
    }
  }
}