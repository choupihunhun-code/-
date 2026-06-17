import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import {
  CurrentUser,
  CurrentUserPayload,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateExportTaskDto } from './dto/create-export-task.dto';
import { ExportService } from './export.service';

@Roles('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('assignments/:assignmentId/exports')
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: CreateExportTaskDto,
  ) {
    return this.exportService.create(user.sub, assignmentId, dto);
  }

  @Get('exports/:exportTaskId')
  detail(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exportTaskId') exportTaskId: string,
  ) {
    return this.exportService.detail(user.sub, exportTaskId);
  }

  @Get('exports/:exportTaskId/download')
  async download(
    @CurrentUser() user: CurrentUserPayload,
    @Param('exportTaskId') exportTaskId: string,
    @Res() response: Response,
  ) {
    const file = await this.exportService.prepareDownload(user.sub, exportTaskId);
    response.download(file.absolutePath, file.fileName);
  }
}
