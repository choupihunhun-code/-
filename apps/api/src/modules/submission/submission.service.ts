import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListSubmissionDto } from './dto/list-submission.dto';
import { RemindNotSubmittedDto } from './dto/remind-not-submitted.dto';
import { StudentSubmitAssignmentDto } from './dto/student-submit-assignment.dto';

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async listByAssignment(
    teacherId: string,
    assignmentId: string,
    query: ListSubmissionDto,
  ) {
    await this.ensureAssignmentOwner(teacherId, assignmentId);

    const where: Prisma.SubmissionWhereInput = {
      assignmentId,
      status: query.submissionStatus,
      aiReview: query.aiStatus ? { status: query.aiStatus } : undefined,
      teacherReview: query.reviewStatus
        ? { status: query.reviewStatus }
        : undefined,
      student: query.keyword
        ? {
            OR: [
              { name: { contains: query.keyword, mode: 'insensitive' } },
              { studentNo: { contains: query.keyword, mode: 'insensitive' } },
            ],
          }
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          student: true,
          aiReview: true,
          teacherReview: true,
        },
      }),
      this.prisma.submission.count({ where }),
    ]);

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async detailForTeacher(teacherId: string, submissionId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: {
        id: submissionId,
        assignment: { teacherId },
      },
      include: {
        student: true,
        assignment: true,
        aiReview: true,
        teacherReview: true,
        files: true,
      },
    });
    if (!submission) {
      throw new NotFoundException('提交记录不存在');
    }
    return submission;
  }

  async detailForStudent(studentId: string, submissionId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, studentId },
      include: {
        assignment: true,
        files: true,
        teacherReview: {
          select: {
            status: true,
            finalScore: true,
            teacherComment: true,
            publishedAt: true,
          },
        },
      },
    });
    if (!submission) {
      throw new NotFoundException('提交记录不存在');
    }
    if (submission.teacherReview?.status !== 'published') {
      return {
        ...submission,
        teacherReview: null,
      };
    }
    return submission;
  }

  async remindNotSubmitted(
    teacherId: string,
    assignmentId: string,
    dto: RemindNotSubmittedDto,
  ) {
    await this.ensureAssignmentOwner(teacherId, assignmentId);
    const where: Prisma.SubmissionWhereInput = {
      assignmentId,
      status: 'not_submitted',
      studentId: dto.studentIds ? { in: dto.studentIds } : undefined,
    };
    const count = await this.prisma.submission.count({ where });
    return {
      remindedCount: count,
      message: '提醒任务已创建。当前版本为占位实现，后续接入短信或站内通知。',
    };
  }

  async studentSubmit(
    studentId: string,
    assignmentId: string,
    dto: StudentSubmitAssignmentDto,
  ) {
    if (!dto.submitText?.trim() && !dto.submitLink?.trim()) {
      throw new BadRequestException('至少需要提交文本、链接或附件');
    }

    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, status: { in: ['published', 'closed'] } },
    });
    if (!assignment) {
      throw new NotFoundException('作业不存在或未发布');
    }

    const now = new Date();
    const isLate = now.getTime() > assignment.dueAt.getTime();
    if (isLate && !assignment.allowLateSubmit) {
      throw new UnprocessableEntityException('作业已截止，不允许迟交');
    }

    const existing = await this.prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('你不在该作业的提交名单中');
    }

    const status = existing.status === 'returned'
      ? 'resubmitted'
      : isLate
        ? 'late_submitted'
        : 'submitted';

    return this.prisma.$transaction(async (tx) => {
      const submission = await tx.submission.update({
        where: { id: existing.id },
        data: {
          submitText: dto.submitText,
          submitLink: dto.submitLink,
          submittedAt: now,
          status,
          isLate,
          returnReason: null,
          version: existing.status === 'returned'
            ? { increment: 1 }
            : existing.version,
        },
      });

      await tx.teacherReview.deleteMany({
        where: { submissionId: submission.id, status: { not: 'published' } },
      });
      await tx.aiReview.deleteMany({
        where: { submissionId: submission.id },
      });

      return submission;
    });
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
}
