import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TeacherReviewController } from './teacher-review.controller';
import { TeacherReviewService } from './teacher-review.service';

@Module({
  imports: [AuthModule],
  controllers: [TeacherReviewController],
  providers: [TeacherReviewService],
})
export class TeacherReviewModule {}
