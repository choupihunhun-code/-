import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(teacherId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });
    if (!teacher) {
      throw new NotFoundException('教师不存在');
    }
    return teacher;
  }

  async updateMe(teacherId: string, dto: UpdateTeacherProfileDto) {
    await this.getMe(teacherId);
    return this.prisma.teacher.update({
      where: { id: teacherId },
      data: dto,
    });
  }

  async getDashboard(teacherId: string) {
    const [activeClassCount, pendingReviewCount, notSubmittedCount] =
      await Promise.all([
        this.prisma.courseClass.count({
          where: { teacherId, status: 'active' },
        }),
        this.prisma.teacherReview.count({
          where: { teacherId, status: 'pending_review' },
        }),
        this.prisma.submission.count({
          where: {
            assignment: { teacherId },
            status: 'not_submitted',
          },
        }),
      ]);

    const todos = await this.buildTodos(teacherId);
    const courseStatus = await this.prisma.courseClass.findMany({
      where: { teacherId, status: 'active' },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        courseName: true,
        className: true,
        activeAssignmentCount: true,
        pendingReviewCount: true,
        studentCount: true,
      },
    });

    return {
      metrics: {
        activeClassCount,
        pendingReviewCount,
        averageSubmitRate: 0,
        notSubmittedCount,
      },
      todos,
      courseStatus,
    };
  }

  private async buildTodos(teacherId: string) {
    const assignments = await this.prisma.assignment.findMany({
      where: {
        teacherId,
        status: { in: ['published', 'closed'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            teacherReviews: {
              where: { status: 'pending_review' },
            },
          },
        },
      },
    });

    return assignments
      .filter((assignment) => assignment._count.teacherReviews > 0)
      .map((assignment) => ({
        type: 'pending_review',
        title: `${assignment.title} 待复核`,
        description: `${assignment._count.teacherReviews} 份 AI 已完成`,
        targetId: assignment.id,
      }));
  }
}
