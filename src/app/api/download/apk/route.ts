import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const filePath = join(process.cwd(), 'public', 'crypgox.apk')
    const fileBuffer = await readFile(filePath)
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="crypgox.apk"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving APK file:', error)
    return new NextResponse('File not found', { status: 404 })
  }
}
