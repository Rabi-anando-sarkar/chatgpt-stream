import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/prisma/client"

const connectionString = process.env.DATABASE_URL;

// not single yet

// const adapter = new PrismaPg(
//     {
//         connectionString
//     }
// )

// const prisma = new PrismaClient(
//     {
//         adapter
//     }
// )

// singleton prisma

const globalForPrisma = globalThis as {
    prisma?: PrismaClient | undefined
}

function createPrismaClient() {
    const url = connectionString

    if(!url) {
        throw new Error("DATABASE_URL not found!")
    }

    const adapter = new PrismaPg({
        connectionString
    })

    return new PrismaClient({
        adapter
    })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}