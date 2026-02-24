import { writeFile, unlink, mkdir, access } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export { formatFileSize, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './file-utils'

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads')

export async function ensureUploadDir() {
  try {
    await access(UPLOAD_DIR)
  } catch {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export function generateFilePath(filename: string): string {
  const ext = filename.split('.').pop() || ''
  const uniqueName = `${randomUUID()}.${ext}`
  return join(UPLOAD_DIR, uniqueName)
}

export async function saveFile(file: File): Promise<{ path: string; filename: string }> {
  await ensureUploadDir()
  
  const filename = generateFilePath(file.name)
  const filePath = join(UPLOAD_DIR, filename.split('/').pop()!)
  
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  await writeFile(filePath, buffer)
  
  return { path: filePath, filename: filename.split('/').pop()! }
}

export async function deleteFile(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch (error) {
    console.error('Failed to delete file:', error)
  }
}
