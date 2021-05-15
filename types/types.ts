export interface GitbookClientOptions {
    version?: "v1";
    spaceId: string;
    gitbookApiUrl: string;
}

export interface GitbookSearchSection {
    key: string;
    title: string;
    content: string;
    url: string;
}

export interface GitbookSearchNode {
    uid: string;
    title: string;
    sections: GitbookSearchSection[];
    url: string;
    path: string;
}
export interface GitbookSpace {
    uid: string;
    name: string;
    baseName: string;
    private: boolean;
    unlisted: boolean;
}

export interface GitbookVariant {
    uid: string;
    ref: string;
    title: string;
    page: GitbookPage;
}
export interface GitbookAsset {
    uid: string;
    name: string;
    downloadURL: string;
    contentType: "image/png" | `${string}/${string}`;
}

export interface GitbookPage {
    uid: string;
    title: string;
    description: string;
    kind: "document" | "group";
    path: string;
    pages: GitbookPage[] | never;
}

export interface GitbookContent {
    uid: string;
    parents: string[];
    variants: GitbookVariant[];
    assets: GitbookAsset[];
}

export interface PathWeight {
    path: string;
    weight: number;
}