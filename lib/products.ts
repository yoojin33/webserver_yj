import { connectDB } from '@/lib/mongodb'
import mongoose, { Schema, models } from 'mongoose'

const LikeSchema = new Schema({
  _id: { type: String, required: true },
  likes: { type: Number, default: 0 },
})
const LikeModel = models.Like || mongoose.model('Like', LikeSchema)

export type Product = {
  id: string
  name: string
  description: string
  likes: number
}

const products: Product[] = [
  { id: '1', name: '머그컵', description: '나의 최애 머그컵', likes: 3 },
  { id: '2', name: '휴대폰', description: '갤럭시 폴드 8', likes: 8 },
  { id: '3', name: '연필', description: '연필, 볼펜', likes: 5 },
  { id: '4', name: '노트', description: '나의 최애 노트', likes: 3 },
  { id: '5', name: '노트북', description: 'Windows 11', likes: 13 },
  { id: '6', name: 'Nextjs', description: 'Web framework', likes: 30 },
]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getProducts(): Promise<Product[]> {
  await delay(700)
  await connectDB()
  const likeDocs = await LikeModel.find().lean()
  likeDocs.forEach((d) => {
    const target = products.find((p) => p.id === d._id)
    if (target) target.likes = d.likes
  })
  return products
}

export async function getProduct(id: string): Promise<Product | undefined> {
  await delay(400)
  await connectDB()
  const likeDoc = await LikeModel.findById(id).lean()
  const target = products.find((p) => p.id === id)
  if (target && likeDoc) target.likes = likeDoc.likes
  return products.find((p) => p.id === id)
}

export async function likeProduct(id: string): Promise<number> {
  await delay(300)
  const product = products.find((p) => p.id === id)
  if (!product) return 0
  product.likes += 1
  await connectDB()
  await LikeModel.findByIdAndUpdate(
    id,
    { likes: product.likes },
    { upsert: true },
  )
  return product.likes
}
