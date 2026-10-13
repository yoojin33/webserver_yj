import bcrypt from 'bcryptjs'
import { connectDB } from './mongodb'
import { User } from '@/models/User'

// 비밀번호 해싱 강도(salt round). 숫자가 클수록 안전하지만 느려집니다.
// 10~12 정도가 실무에서 흔히 쓰는 기본값입니다.
const SALT_ROUNDS = 10

export async function createUser(input: {
  name: string
  email: string
  password: string
}) {
  await connectDB()

  const existing = await User.findOne({ email: input.email })
  if (existing) {
    throw new Error('이미 가입된 이메일입니다.')
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
  })

  return { id: String(user._id), name: user.name, email: user.email }
}
