import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUploadTokenDto } from './dto/create-upload-token.dto';

@Injectable()
export class FileService {
  private readonly uploadRoot = resolve(process.env.UPLOAD_ROOT || './uploads');

  constructor(private readonly prisma: PrismaService) {}

  async createUploadToken(actorId: string, dto: CreateUploadTokenDto) {
    this.ensureUploadRoot();
    const storageKey = `${dto.scene}/${randomUUID()}-${dto.fileName}`;
    const absolutePath = join(this.uploadRoot, storageKey);
    const fileUrl = `/api/files/${storageKey}`;

    const file = await this.prisma.fileAsset.create({
      data: {
        scene: dto.scene,
        fileName: dto.fileName,
        contentType: dto.contentType,
        fileSize: dto.fileSize,
        storageKey,
        fileUrl,
        assignmentId: dto.assignmentId,
        submissionId: dto.submissionId,
        uploadedBy: actorId,
      },
    });

    return {
      file,
      uploadUrl: absolutePath,
      fileUrl,
      expiresIn: 600,
      note: 'MVP 本地存储占位：当前返回本地目标路径，后续可替换为对象存储直传 URL。',
    };
  }

  async prepareDownload(actorId: string, fileId: string) {
    const file = await this.prisma.fileAsset.findUnique({
      where: { id: fileId },
      include: {
        assignment: true,
        submission: {
          include: { assignment: true },
        },
      },
    });
    if (!file) {
      throw new NotFoundException('文件不存在');
    }

    const isOwner =
      file.uploadedBy === actorId ||
      file.assignment?.teacherId === actorId ||
      file.submission?.studentId === actorId ||
      file.submission?.assignment.teacherId === actorId;

    if (!isOwner) {
      throw new NotFoundException('文件不存在');
    }

    return {
      absolutePath: join(this.uploadRoot, file.storageKey),
      fileName: file.fileName,
      contentType: file.contentType,
    };
  }

  private ensureUploadRoot() {
    if (!existsSync(this.uploadRoot)) {
      mkdirSync(this.uploadRoot, { recursive: true });
    }
  }
}
