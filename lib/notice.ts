import { Notice as NoticeModel } from '@/models/Notice'
import { connectDB } from './mongodb'

await NoticeModel.insertMany
export type Notice = {
  authorId: string
  authorName: string
  id: string
  title: string
  content: string
  createdAt: string
  views: number
}

type NoticeDocLike = {
  _id: unknown
  title: string
  content: string
  authorId: unknown
  authorName: string
  createdAt?: Date
  views?: number
}

function toNotice(doc: NoticeDocLike): Notice {
  return {
    id: String(doc._id),
    title: doc.title,
    content: doc.content,
    createdAt: (doc.createdAt ?? new Date()).toISOString().slice(0, 10),
    views: doc.views ?? 0,
    authorId: String(doc.authorId),
    authorName: doc.authorName,
  }
}

async function seedIfEmpty() {
  const count = await NoticeModel.countDocuments()
  if (count > 0) return
}

//let nextId = 4

/*function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}*/

export async function getNotices(): Promise<Notice[]> {
  await connectDB()
  await seedIfEmpty()
  const docs = await NoticeModel.find().sort({ createdAt: -1 }).lean()
  return docs.map((doc) => toNotice(doc as NoticeDocLike))
}

export async function getNotice(id: string): Promise<Notice | undefined> {
  await connectDB()
  try {
    //const doc = await NoticeModel.findById(id).lean()
    const doc = await NoticeModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { returnDocument: 'after' },
    ).lean()
    return doc ? toNotice(doc as NoticeDocLike) : undefined
  } catch {
    return undefined
  }

  /* await delay(400)
  const notice = notices.find((n) => n.id === id)
  if (notice) {
    notice.views += 1
  }
  return notice*/
}

export async function createNotice(input: {
  title: string
  //author: string
  content: string
  authorId: string
  authorName: string
}): Promise<Notice> {
  await connectDB()
  const doc = await NoticeModel.create(input)
  return toNotice(doc as unknown as NoticeDocLike)
}

export async function deleteNotice(id: string): Promise<void> {
  await connectDB()
  await NoticeModel.findByIdAndDelete(id)
}
