import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BatchPublishTeacherReviewDto } from './dto/batch-publish-teacher-review.dto';
import { PublishTeacherReviewDto } from './dto/publish-teacher-review.dto';
import { ReturnSubmissionDto } from './dto/return-submission.dto';
import { SaveTeacherReviewDto } from './dto/save-teacher-review.dto';

@Injectable()
export class TeacherReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkbench(teacherId: string, assignmentId: string) {
    const assignment = await this.ensureAssignmentOwner(teacherId, assignmentId);
    const queue = await this.prisma.submission.findMany({
      where: { assignmentId },
      orderBy: { updatedAt: 'desc' },
      include: {
        student: true,
        aiReview: true,
        teacherReview: true,
      },
    });

    return {
      assignment,
      queue,
      currentSubmission: queue[0] || null,
      aiReview: queue[0]?.aiReview || null,
      teacherReview: queue[0]?.teacherReview || null,
    };
  }

  async getSubmissionReview(teacherId: string, submissionId: string) {
    const submission = await this.ensureSubmissionOwner(teacherId, submissionId);
    return submission;
  }

  async saveDraft(
    teacherId: string,
    submissionId: string,
    dto: SaveTeacherReviewDto,
  ) {
    const submission = await this.ensureSubmissionOwner(teacherId, submissionId);
    if (submission.status === 'not_submitted') {
      throw new BadRequestException('学生尚未提交，不能批阅');
    }
    if (submission.teacherReview?.status === 'published') {
      throw new UnprocessableEntityException('已发布结果请走更正流程');
    }

    return this.prisma.teacherReview.upsert({
      where: { submissionId },
      update: {
        finalScore: dto.finalScore,
        teacherComment: dto.teacherComment,
        adoptedAiScore: dto.adoptedAiScore ?? false,
        adoptedAiComment: dto.adoptedAiComment ?? false,
        status: dto.status || 'draft_saved',
      },
      create: {
        submissionId,
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        teacherId,
        aiReviewId: submission.aiReview?.id,
        finalScore: dto.finalScore,
        teacherComment: dto.teacherComment,
        adoptedAiScore: dto.adoptedAiScore ?? false,
        adoptedAiComment: dto.adoptedAiComment ?? false,
        status: dto.status || 'draft_saved',
      },
    });
  }

  async publish(
    teacherId: string,
    submissionId: string,
    dto: PublishTeacherReviewDto,
  ) {
    const submission = await this.ensureSubmissionOwner(teacherId, submissionId);
    if (submission.status === 'not_submitted') {
      throw new BadRequestException('学生尚未提交，不能发布结果');
    }

    return this.prisma.$transaction(async (tx) => {
      const teacherReview = await tx.teacherReview.upsert({
        where: { submissionId },
        update: {
          finalScore: dto.finalScore,
          teacherComment: dto.teacherComment,
          status: 'published',
          publishedAt: new Date(),
        },
        create: {
          submissionId,
          assignmentId: submission.assignmentId,
          studentId: submission.studentId,
          teacherId,
          aiReviewId: submission.aiReview?.id,
          finalScore: dto.finalScore,
          teacherComment: dto.teacherComment,
          status: 'published',
          publishedAt: new Date(),
        },
      });

      const publication = await tx.resultPublication.create({
        data: {
          teacherReviewId: teacherReview.id,
          assignmentId: submission.assignmentId,
          studentId: submission.studentId,
          finalScore: dto.finalScore,
          teacherComment: dto.teacherComment,
          visibility: 'student_visible',
          publishedBy: teacherId,
        },
      });

      return {
        teacherReview,
        publication,
      };
    });
  }

  async returnSubmission(
    teacherId: string,
    submissionId: string,
    dto: ReturnSubmissionDto,
  ) {
    const submission = await this.ensureSubmissionOwner(teacherId, submissionId);
    if (submission.status === 'not_submitted') {
      throw new BadRequestException('学生尚未提交，不能退回');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.teacherReview.upsert({
        where: { submissionId },
        update: { status: 'returned', teacherComment: dto.returnReason },
        create: {
          submissionId,
          assignmentId: submission.assignmentId,
          studentId: submission.studentId,
          teacherId,
          aiReviewId: submission.aiReview?.id,
          status: 'returned',
          teacherComment: dto.returnReason,
        },
      });

      return tx.submission.update({
        where: { id: submissionId },
        data: {
          status: 'returned',
          returnReason: dto.returnReason,
        },
      });
    });
  }

  async publishBatch(
    teacherId: string,
    assignmentId: string,
    dto: BatchPublishTeacherReviewDto,
  ) {
    await this.ensureAssignmentOwner(teacherId, assignmentId);
    const reviews = await this.prisma.teacherReview.findMany({
      where: {
        assignmentId,
        submissionId: { in: dto.submissionIds },
        teacherId,
      },
    });

    const invalid = reviews.filter((review) => review.finalScore === null);
    if (invalid.length > 0) {
      throw new UnprocessableEntityException('存在未填写最终分数的批阅记录');
    }

    const results = [];
    for (const review of reviews) {
      results.push(
        await this.publish(teacherId, review.submissionId, {
          finalScore: review.finalScore!,
          teacherComment: review.teacherComment || undefined,
        }),
      );
    }

    return {
      publishedCount: results.length,
      items: results,
    };
  }

  private async ensureAssignmentOwner(teacherId: string, assignmentId: string) {
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

  private async ensureSubmissionOwner(teacherId: string, submissionId: string) {
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
}
