import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * 密码加密工具
 */

/**
 * 哈希密码
 * @param password 明文密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hash 哈希密码
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * 生成验证码（6位数字）
 */
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
