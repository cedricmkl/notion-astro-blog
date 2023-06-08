import type { BlockObjectResponse, TextRichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import type { Block, User } from "./types"

export function getTextPropertyValue(property: any): string {
    return (property.type === "title" ?
        property.title : property.rich_text)[0].plain_text || ""
}

export function getSelectPropertyValues(property: any): string[] {
    return property.multi_select.map((option: any) => option.name)
}

export function getUserPropertyValue(property: any): User {
    return {
        id: property.people[0].id,
        name: property.people[0].name,
        avatar: property.people[0].avatar_url ?? `https://api.dicebear.com/6.x/pixel-art-neutral/svg?seed=${property.people[0].name}`,
    }
}

export function getDatePropertyValue(property: any): Date {
    return new Date(property.date.start)
}

export function parseBlock(response: BlockObjectResponse): Block {

    switch (response.type) {
        case "heading_1":
        case "heading_2":
        case "heading_3":
        case "paragraph":
        case "bulleted_list_item":
        case "numbered_list_item":
            return {
                type: response.type,
                // @ts-ignore - typescript doesnt like response[response.type]
                text: response[response.type].rich_text.map((text) => ({
                    content: (text as TextRichTextItemResponse).text.content,
                    link: (text as TextRichTextItemResponse).text.link?.url
                })),
            }
        default:
            throw new Error(`Unsupported block type: ${response.type}`)
    }
}