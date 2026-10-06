import { Notice as NoticeModel } from '@/models/Notice'
import { connectDB } from './mongodb'

await NoticeModel.insertMany
export type Notice = {
  id: string
  title: string
  author: string
  content: string
  createdAt: string
  views: number
}

type NoticeDocLike = {
  _id: unknown
  title: string
  author: string
  content: string
  createdAt?: Date
  views?: number
}

function toNotice(doc: NoticeDocLike): Notice {
  return {
    id: String(doc._id),
    title: doc.title,
    author: doc.author,
    content: doc.content,
    createdAt: (doc.createdAt ?? new Date()).toISOString().slice(0, 10),
    views: doc.views ?? 0,
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
  author: string
  content: string
}): Promise<Notice> {
  await connectDB()
  const doc = await NoticeModel.create(input)
  return toNotice(doc as unknown as NoticeDocLike)

  /*await delay(300)
  const notice: Notice = {
    id: String(nextId++),
    title: input.title,
    author: input.author,
    content: input.content,
    createdAt: new Date().toISOString().slice(0, 10),
    views: 0,
  }
  notices.push(notice)
  return notice*/
}
