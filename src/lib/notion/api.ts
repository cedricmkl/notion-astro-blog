import { Client } from "@notionhq/client"
import type { Block, BlogPost, User } from "./types"
import type { BlockObjectRequest, BlockObjectResponse, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { getDatePropertyValue, getSelectPropertyValues, getTextPropertyValue, getUserPropertyValue, parseBlock } from "./helpers"

const DATABASE_ID = import.meta.env.NOTION_DATABASE_ID

const notion = new Client({
    auth: import.meta.env.NOTION_SECRET
})

const cache = new Map<string, BlogPost>()

export async function getBlockContent(id: string): Promise<Block[]> {
    const result = await notion.blocks.children.list({
        block_id: id,
        page_size: 100
    })
    return result.results.map((block) => parseBlock(block as BlockObjectResponse))
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    if (cache.has(slug)) {
        return cache.get(slug)!
    }

    await getBlogPosts()
    return cache.get(slug) ?? null
}

export async function getBlogPosts() {
    const result = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: {
            property: "published",
            checkbox: {
                equals: true
            }
        },
        sorts: [
            {
                property: "created_at",
                direction: "descending"
            }
        ]
    });
    const posts = await Promise.all(result.results.map(async (page) => await parseBlogPost(page as PageObjectResponse)))
    posts.forEach((post) => cache.set(post.slug, post));
    return posts
}

async function parseBlogPost(page: PageObjectResponse): Promise<BlogPost> {
    return {
        slug: getTextPropertyValue(page.properties["slug"]),
        title: getTextPropertyValue(page.properties["title"]),
        tagline: getTextPropertyValue(page.properties["tagline"]),
        tags: getSelectPropertyValues(page.properties["tags"]),
        author: getUserPropertyValue(page.properties["author"]),
        createdAt: getDatePropertyValue(page.properties["created_at"]),
        content: await getBlockContent(page.id),
    }
}
