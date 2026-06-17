import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ListAssignmentDto } from './dto/list-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async list(teacherId: string, query: ListAssignmentDto) {
    const where: Prisma.AssignmentWhereInput = {
      teacherId,
      classId: query.classId,
      status: query.status,
      title: query.keyword
        ? { contains: query.keyword, mode: 'insensitive' }
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.assignment.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          courseClass: {
            select: { id: true, courseName: true, className: true },
          },
        },
      }),
      this.prisma.assignment.count({ where }),
    ]);

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async create(teacherId: string, dto: CreateAssignmentDto) {
    await this.ensureClassOwner(teacherId, dto.classId);
    this.validateAssignmentInput(dto);

    return this.prisma.assignment.create({
      data: {
        teacherId,
        classId: dto.classId,
        title: dto.title,
        description: dto.description,
        dueAt: new Date(dto.dueAt),
        submitModes: dto.submitModes,
        scoreType: dto.scoreType,
        maxScore: dto.maxScore ?? 100,
        aiEnabled: dto.aiEnabled,
        aiRubric: dto.aiRubric,
        aiCommentStyle: dto.aiCommentStyle,
        allowLateSubmit: dto.allowLateSubmit ?? true,
      },
    });
  }

  async detail(teacherId: string, assignmentId: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, teacherId },
      include: {
        courseClass: {
          select: { id: true, courseName: true, className: true },
        },
      },
    });
    if (!assignment) {
      throw new NotFoundException('作业不存在');
    }
    return assignment;
  }

  async update(
    teacherId: string,
    assignmentId: string,
    dto: UpdateAssignmentDto,
  ) {
    const assignment = await this.detail(teacherId, assignmentId);
    if (assignment.status === 'archived' || assignment.status === 'deleted') {
      throw new UnprocessableEntityException('当前作业状态不允许修改');
    }
    if (dto.aiEnabled) {
      this.validateAssignmentInput({
        ...assignment,
        ...dto,
        dueAt: dto.dueAt ?? assignment.dueAt.toISOString(),
      } as CreateAssignmentDto);
    }

    return this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...dto,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
    });
  }

  async publish(teacherId: string, assignmentId: string) {
    const assignment = await this.detail(teacherId, assignmentId);
    if (assignment.status !== 'draft') {
      throw new UnprocessableEntityException('只有草稿作业可以发布');
    }
    this.validateAssignmentInput({
      ...assignment,
      dueAt: assignment.dueAt.toISOString(),
    } as CreateAssignmentDto);

    const classStudents = await this.prisma.classStudent.findMany({
      where: { classId: assignment.classId, status: 'active' },
      select: { studentId: true },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const published = await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'published',
          publishedAt: new Date(),
        },
      });

      if (classStudents.length > 0) {
        await tx.submission.createMany({
          data: classStudents.map((item) => ({
            assignmentId,
            studentId: item.studentId,
            status: 'not_submitted',
          })),
          skipDuplicates: true,
        });
      }

      await tx.courseClass.update({
        where: { id: assignment.classId },
        data: {
          activeAssignmentCount: { increment: 1 },
        },
      });

      return published;
    });

    return {
      assignment: result,
      createdSubmissionCount: classStudents.length,
    };
  }

  async close(teacherId: string, assignmentId: string) {
    await this.detail(teacherId, assignmentId);
    return this.prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: 'closed' },
    });
  }

  async archive(teacherId: string, assignmentId: string) {
    await this.detail(teacherId, assignmentId);
    return this.prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: 'archived' },
    });
  }

  async stats(teacherId: string, assignmentId: string) {
    await this.detail(teacherId, assignmentId);
    const [
      studentCount,
      submittedCount,
      notSubmittedCount,
      pendingReviewCount,
      publishedCount,
    ] = await Promise.all([
      this.prisma.submission.count({ where: { assignmentId } }),
      this.prisma.submission.count({
        where: {
          assignmentId,
          status: { in: ['submitted', 'late_submitted', 'resubmitted'] },
        },
      }),
      this.prisma.submission.count({
        where: { assignmentId, status: 'not_submitted' },
      }),
      this.prisma.teacherReview.count({
        where: { assignmentId, status: 'pending_review' },
      }),
      this.prisma.teacherReview.count({
        where: { assignmentId, status: 'published' },
      }),
    ]);

    return {
      studentCount,
      submittedCount,
      notSubmittedCount,
      pendingReviewCount,
      publishedCount,
    };
  }

  private async ensureClassOwner(teacherId: string, classId: string) {
    const courseClass = await this.prisma.courseClass.findFirst({
      where: { id: classId, teacherId },
    });
    if (!courseClass) {
      throw new NotFoundException('课程班不存在');
    }
    return courseClass;
  }

  private validateAssignmentInput(dto: CreateAssignmentDto) {
    if (new Date(dto.dueAt).getTime() < Date.now()) {
      throw new BadRequestException('截止时间不能早于当前时间');
    }
    if (dto.aiEnabled && !dto.aiRubric?.trim()) {
      throw new BadRequestException('启用 AI 初评时必须填写评分标准');
    }
  }
}
