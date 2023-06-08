export type BlogPost = {
    slug: string
    title: string
    tags: string[]
    tagline: string
    author: User
    createdAt: Date
    content: Block[]
}

export type User = {
    id: string
    name: string
    avatar: string
}


export function isTextBlock(block: Block): boolean {
    return block.type === "heading_1" || block.type === "heading_2" || block.type === "heading_3" || block.type === "paragraph"
}

export type BlockType = "heading_1" | "heading_2" | "heading_3" | "paragraph" | "bulleted_list_item" | "numbered_list_item" | "to_do"

export type Block = {
    type: BlockType
    text?: Text[]
    checked?: boolean
}

export type Text = {
    content: string
    link?: string
}

export type TodoBlock = Block & { checked: boolean }