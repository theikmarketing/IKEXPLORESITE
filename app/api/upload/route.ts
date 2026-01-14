import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 타입 확인 (이미지만 허용)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cloudinary가 설정되어 있으면 Cloudinary 사용
    if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'ktravel-website' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        // Buffer를 스트림으로 변환하여 업로드
        const stream = require('stream');
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);
        bufferStream.pipe(uploadStream);
      });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        filename: result.public_id,
      });
    }

    // 로컬 저장 (Cloudinary 설정이 없는 경우)
    // 고유한 파일명 생성
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadDir, filename);

    // 업로드 디렉토리가 없으면 생성
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // 디렉토리가 이미 존재하는 경우 무시
    }

    // 파일 저장
    await writeFile(filepath, buffer);

    // 공개 URL 반환
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: url,
      filename: filename,
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
