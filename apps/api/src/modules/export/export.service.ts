import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Workbook } from 'exceljs';
import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExportTaskDto } from './dto/create-export-task.dto';

interface ExportColumn {
  key: string;
  header: string;
  width: number;
  resolve: (row: ExportRow) => string | number | null;
}

type ExportRow = Prisma.SubmissionGetPayload<{
  include: {
    student: true;
    teacherReview: true;
  };
}>;

@Injectable()
export class ExportService {
  private readonly exportRoot = resolve(process.env.EXPORT_ROOT || './exports');

  private readonly defaultFields = [
    'student_no',
    'student_name',
    'submission_status',
    'final_score',
    'teacher_comment',
    'published_at',
  ];

  constructor(private readonly prisma: PrismaService) {}

  async create(teacherId: string, assignmentId: string, dto: CreateExportTaskDto) {
    const assignment = await this.ensureAssignmentOwner(teacherId, assignmentId);
    this.ensureExportRoot();

    const fields = dto.fields?.length ? dto.fields : this.defaultFields;
    const task = await this.prisma.exportTask.create({
      data: {
        assignmentId,
        teacherId,
        exportFormat: dto.exportFormat || 'xlsx',
        fields,
        status: 'processing',
      },
    });

    try {
      const rows = await this.loadRows(assignmentId);
      const fileName = `${assignment.title}-${task.id}.xlsx`.replace(/[\\/:*?"<>|]/g, '_');
      const absolutePath = join(this.exportRoot, fileName);
      await this.writeWorkbook(absolutePath, fields, rows);

      return this.prisma.exportTask.update({
        where: { id: task.id },
        data: {
          status: 'completed',
          fileUrl: absolutePath,
          completedAt: new Date(),
        },
      });
    } catch (error) {
      await this.prisma.exportTask.update({
        where: { id: task.id },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : '导出失败',
        },
      });
      throw error;
    }
  }

  async detail(teacherId: string, exportTaskId: string) {
    const task = await this.prisma.exportTask.findFirst({
      where: { id: exportTaskId, teacherId },
    });
    if (!task) {
      throw new NotFoundException('导出任务不存在');
    }
    return task;
  }

  async prepareDownload(teacherId: string, exportTaskId: string) {
    const task = await this.detail(teacherId, exportTaskId);
    if (task.status !== 'completed' || !task.fileUrl) {
      throw new UnprocessableEntityException('导出任务尚未完成');
    }
    return {
      absolutePath: task.fileUrl,
      fileName: task.fileUrl.split(/[\\/]/).pop() || '成绩导出.xlsx',
    };
  }

  private async ensureAssignmentOwner(teacherId: string, assignmentId: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, teacherId },
    });
    if (!assignment) {
      throw new NotFoundException('作业不存在');
    }
    return assignment;
  }

  private loadRows(assignmentId: string) {
    return this.prisma.submission.findMany({
      where: { assignmentId },
      orderBy: { updatedAt: 'asc' },
      include: {
        student: true,
        teacherReview: true,
      },
    });
  }

  private async writeWorkbook(
    absolutePath: string,
    fields: string[],
    rows: ExportRow[],
  ) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('成绩');
    const columns = this.resolveColumns(fields);
    worksheet.columns = columns.map((column) => ({
      key: column.key,
      header: column.header,
      width: column.width,
    }));

    rows.forEach((row) => {
      const value: Record<string, string | number | null> = {};
      columns.forEach((column) => {
        value[column.key] = column.resolve(row);
      });
      worksheet.addRow(value);
    });

    worksheet.getRow(1).font = { bold: true };
    await workbook.xlsx.writeFile(absolutePath);
  }

  private resolveColumns(fields: string[]): ExportColumn[] {
    const allColumns: ExportColumn[] = [
      {
        key: 'student_no',
        header: '学号',
        width: 18,
        resolve: (row) => row.student.studentNo,
      },
      {
        key: 'student_name',
        header: '姓名',
        width: 14,
        resolve: (row) => row.student.name,
      },
      {
        key: 'submission_status',
        header: '提交状态',
        width: 18,
        resolve: (row) => row.status,
      },
      {
        key: 'final_score',
        header: '最终分数',
        width: 12,
        resolve: (row) => row.teacherReview?.finalScore ?? null,
      },
      {
        key: 'teacher_comment',
        header: '教师评语',
        width: 40,
        resolve: (row) => row.teacherReview?.teacherComment ?? '',
      },
      {
        key: 'published_at',
        header: '发布时间',
        width: 24,
        resolve: (row) => row.teacherReview?.publishedAt?.toISOString() ?? '',
      },
    ];

    return fields
      .map((field) => allColumns.find((column) => column.key === field))
      .filter((column): column is ExportColumn => Boolean(column));
  }

  private ensureExportRoot() {
    if (!existsSync(this.exportRoot)) {
      mkdirSync(this.exportRoot, { recursive: true });
    }
  }
}
