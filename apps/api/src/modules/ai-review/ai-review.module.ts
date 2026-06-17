import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiReviewController } from './ai-review.controller';
import { AiReviewService } from './ai-review.service';

@Module({
  imports: [AuthModule],
  controllers: [AiReviewController],
  providers: [AiReviewService],
  exports: [AiReviewService],
})
export class AiReviewModule {}
