import { Module } from '@nestjs/common';
import { AiReviewModule } from './modules/ai-review/ai-review.module';
import { AuthModule } from './modules/auth/auth.module';
import { AssignmentModule } from './modules/assignment/assignment.module';
import { CourseClassModule } from './modules/course-class/course-class.module';
import { ExportModule } from './modules/export/export.module';
import { FileModule } from './modules/file/file.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { SubmissionModule } from './modules/submission/submission.module';
import { TeacherReviewModule } from './modules/teacher-review/teacher-review.module';
import { TeacherModule } from './modules/teacher/teacher.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TeacherModule,
    CourseClassModule,
    AssignmentModule,
    SubmissionModule,
    AiReviewModule,
    TeacherReviewModule,
    FileModule,
    ExportModule,
  ],
})
export class AppModule {}
