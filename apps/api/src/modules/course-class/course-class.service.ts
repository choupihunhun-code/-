import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseClassDto } from './dto/create-course-class.dto';
import { ImportStudentsDto } from './dto/import-students.dto';
import { ListCourseClassDto } from './dto/list-course-class.dto';
import { UpdateCourseClassDto } from './dto/update-course-class.dto';

@Injectable()
export class CourseClassService {
  constructor(private readonly prisma: PrismaService) {}

  async list(teacherId: string, query: ListCourseClassDto) {
    const where: Prisma.CourseClassWhereInput = {
      teacherId,
      status: query.status,
      OR: query.keyword
        ? [
            { courseName: { contains: query.keyword, mode: 'insensitive' } },
            { className: { contains: query.keyword, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      this.prisma.courseClass.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.courseClass.count({ where }),
    ]);

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  create(teacherId: string, dto: CreateCourseClassDto) {
    return this.prisma.courseClass.create({
      data: {
        teacherId,
        courseName: dto.courseName,
        className: dto.className,
        term: dto.term,
        courseType: dto.courseType || 'other',
        description: dto.description,
      },
    });
  }

  async detail(teacherId: string, classId: string) {
    const courseClass = await this.prisma.courseClass.findFirst({
      where: { id: classId, teacherId },
      include: {
        _count: {
          select: {
            classStudents: true,
            assignments: true,
          },
        },
      },
    });
    if (!courseClass) {
      throw new NotFoundException('课程班不存在');
    }
    return courseClass;
  }

  async update(teacherId: string, classId: string, dto: UpdateCourseClassDto) {
    await this.detail(teacherId, classId);
    return this.prisma.courseClass.update({
      where: { id: classId },
      data: dto,
    });
  }

  async archive(teacherId: string, classId: string) {
    await this.detail(teacherId, classId);
    return this.prisma.courseClass.update({
      where: { id: classId },
      data: { status: 'archived' },
    });
  }

  async listStudents(teacherId: string, classId: string) {
    await this.detail(teacherId, classId);
    return this.prisma.classStudent.findMany({
      where: { classId, status: 'active' },
      orderBy: { joinedAt: 'desc' },
      include: { student: true },
    });
  }

  async importStudentsJson(
    teacherId: string,
    classId: string,
    dto: ImportStudentsDto,
  ) {
    await this.detail(teacherId, classId);

    const errors: Array<{ row: number; message: string }> = [];
    let importedCount = 0;
    let skippedCount = 0;

    for (const [index, item] of dto.students.entries()) {
      const row = index + 1;
      const duplicateInClass = await this.prisma.classStudent.findFirst({
        where: {
          classId,
          student: { studentNo: item.studentNo },
          status: 'active',
        },
      });

      if (duplicateInClass) {
        skippedCount += 1;
        errors.push({ row, message: `学号 ${item.studentNo} 已在课程班中` });
        continue;
      }

      const student = await this.prisma.student.upsert({
        where: { studentNo: item.studentNo },
        update: {
          name: item.name,
          phone: item.phone,
          email: item.email,
        },
        create: {
          name: item.name,
          studentNo: item.studentNo,
          phone: item.phone,
          email: item.email,
        },
      });

      await this.prisma.classStudent.create({
        data: {
          classId,
          studentId: student.id,
          displayClassName: item.displayClassName,
        },
      });
      importedCount += 1;
    }

    await this.prisma.courseClass.update({
      where: { id: classId },
      data: { studentCount: { increment: importedCount } },
    });

    return {
      importedCount,
      skippedCount,
      errors,
    };
  }
}
