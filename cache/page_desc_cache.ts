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
    this.fillCacheRecursively(page, '');
    console.log(this.data);
  }

  private setUpTimer = () => {
    setInterval(() => {
      this.fillData();
    }, 60 * 60 * 1000);
  }

  public getValue(path: string) {
    return this.data[path];
  }

  private fillCacheRecursively = (page: GitbookPage, parentPath: string) => {
    const pagePath = page.path === 'undefined' ? '' : page.path;
    const currentPath = `${parentPath}/${pagePath}`;
    this.data[currentPath] = page.description;
    if (page.pages.length === 0) return;
    for (const pg of page.pages) {
      this.fillCacheRecursively(pg, currentPath === '/' ? '' : currentPath);
    }
  }
}