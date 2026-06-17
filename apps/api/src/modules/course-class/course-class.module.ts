import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CourseClassController } from './course-class.controller';
import { CourseClassService } from './course-class.service';

@Module({
  imports: [AuthModule],
  controllers: [CourseClassController],
  providers: [CourseClassService],
})
export class CourseClassModule {}
