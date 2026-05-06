import {
  JsonController,
  Post,
  Req,
  Res,
  Authorized,
} from 'routing-controllers'
import { Service } from 'typedi'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { success, error } from '../utils/response'
import { logger } from '../utils/logger'
import type { ApiResponse } from '../types'
import type { Request, Response } from 'express'

// 确保上传目录存在
const UPLOAD_DIR = process.env.UPLOAD_PATH || 'uploads'
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (_req, file, cb) => {
    // 使用 UUID 作为文件名，防止路径遍历
    const uniqueName = `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    // 严格限制 MIME 类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()

    if (allowedTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型，仅支持 jpg/png/gif/webp'))
    }
  },
})

interface UploadedFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  destination: string
  filename: string
  path: string
  size: number
}

/**
 * 上传控制器
 * 处理图片上传
 */
@Service()
@JsonController('/upload')
export class UploadController {
  /**
   * 上传单张图片
   * POST /api/v1/upload/image
   */
  @Post('/image')
  @Authorized()
  async uploadImage(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ApiResponse<{ url: string; width: number; height: number }>> {
    return new Promise((resolve, reject) => {
      const uploadSingle = upload.single('file')

      uploadSingle(req, res, (err) => {
        if (err) {
          logger.warn('文件上传失败', { error: err.message })
          reject(error(err.message, 400))
          return
        }

        const file = req.file as unknown as UploadedFile
        if (!file) {
          reject(error('没有上传文件', 400))
          return
        }

        // 记录上传日志
        logger.info('文件上传成功', {
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
        })

        // TODO: 上传到 CDN（如阿里云 OSS、七牛云等）
        // 这里返回本地路径作为示例
        const url = `/uploads/${file.filename}`

        // TODO: 获取图片真实宽高（可使用 sharp 库）
        resolve(success({
          url,
          width: 800,
          height: 600,
        }, '上传成功'))
      })
    })
  }

  /**
   * 上传多张图片
   * POST /api/v1/upload/images
   */
  @Post('/images')
  @Authorized()
  async uploadImages(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ApiResponse<{ urls: { url: string; width: number; height: number }[] }>> {
    return new Promise((resolve, reject) => {
      const uploadMultiple = upload.array('files[]', 9) // 最多9张

      uploadMultiple(req, res, (err) => {
        if (err) {
          logger.warn('批量文件上传失败', { error: err.message })
          reject(error(err.message, 400))
          return
        }

        const files = req.files as unknown as UploadedFile[]
        if (!files || files.length === 0) {
          reject(error('没有上传文件', 400))
          return
        }

        // 记录上传日志
        logger.info('批量文件上传成功', {
          count: files.length,
          filenames: files.map(f => f.filename),
        })

        const urls = files.map(file => ({
          url: `/uploads/${file.filename}`,
          width: 800,
          height: 600,
        }))

        resolve(success({ urls }, '上传成功'))
      })
    })
  }
}
