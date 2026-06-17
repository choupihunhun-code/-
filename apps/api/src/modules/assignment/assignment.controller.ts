import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ListAssignmentDto } from './dto/list-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Roles('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserPayload, @Query() query: ListAssignmentDto) {
    return this.assignmentService.list(user.sub, query);
  }

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.assignmentService.create(user.sub, dto);
  }

  @Get(':assignmentId')
  detail(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.assignmentService.detail(user.sub, assignmentId);
  }

  @Patch(':assignmentId')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.assignmentService.update(user.sub, assignmentId, dto);
  }

  @Post(':assignmentId/publish')
  publish(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.assignmentService.publish(user.sub, assignmentId);
  }

  @Post(':assignmentId/close')
  close(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.assignmentService.close(user.sub, assignmentId);
  }

  @Post(':assignmentId/archive')
  archive(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.assignmentService.archive(user.sub, assignmentId);
  }

  @Get(':assignmentId/stats')
  stats(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.assignmentService.stats(user.sub, assignmentId);
  }
}
