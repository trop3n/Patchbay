import { writeFile, unlink, mkdir, access } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { formatFileSize, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './file-utils'

export { formatFileSize, ALLOWED_MIME_TYPES, MAX_FILE_SIZE }

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
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds the maximum allowed size of ${formatFileSize(MAX_FILE_SIZE)}`)
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`File type "${file.type}" is not allowed`)
  }

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
