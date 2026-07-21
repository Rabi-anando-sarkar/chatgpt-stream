"use server"  //for crud operations which directly talk to my database

import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache";

export type ConversationListItem = {
    id: string;
    title: string;
    isPinned: boolean;
    isArchived: boolean;
    lastMeesageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

async function assertOwnsConversation(conversationId:string, userId: string) {
    const conversation = await prisma.conversation.findFirst(
        {
            where: {
                id: conversationId,
                userId
            }
        }
    )

    if(!conversation) {
        throw new Error("Conversation not found")
    }

    return conversation
}

// READ CONVERSATION

export async function listConversations(): Promise<ConversationListItem[]> {
    const user = await requireUser()

    return prisma.conversation.findMany(
        {
            where: {
                userId: user.id,
                isArchived: false
            },
            orderBy: [
                {
                    isPinned: "desc"
                },
                {
                    lastMeesageAt: "desc"
                }
            ],
            select: {
                id: true,
                title: true,
                isPinned: true,
                isArchived: true,
                lastMeesageAt: true,
                createdAt: true,
                updatedAt: true,
            },
        }
    )
}

// CREATE CONVERSATION

export async function createConversation(title = "New Chat") {
    const user = await requireUser()

    return prisma.conversation.create(
        {
            data: {
                userId: user.id,
                title: title.trim() || "New Chat"
            }
        }
    )
}

// DELETE CONVERSATION

export async function deleteConversation(conversationId: string) {
    const user = await requireUser()
    
    await assertOwnsConversation(conversationId,user.id)

    await prisma.conversation.delete(
        {
            where: {
                id: conversationId
            }
        }
    )

    revalidatePath("/")
    return {
        id: conversationId
    }
}

// UPDATE CONVERSATION

export async function updateConversation(
    conversationId: string,
    data: {
        title?: string;
        isPinned?: boolean;
        isArchived?: boolean;
    }
) {
    const user = await requireUser()

    await assertOwnsConversation(conversationId,user.id)

    const conversation = await prisma.conversation.update(
        {
            where: {
                id: conversationId
            },
            data: {
                ...(data.title !== undefined ? {title: data.title.trim() || "New Chat"} : {}),
                ...(data.isPinned !== undefined ? {isPinned: data.isPinned} : {}),
                ...(data.isArchived !== undefined ? {isArchived: data.isArchived} : {})
            }
        }
    )

    revalidatePath("/")
    revalidatePath(`/c/${conversationId}`)
    return conversation
}