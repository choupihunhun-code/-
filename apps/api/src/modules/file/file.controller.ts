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
import { CreateUploadTokenDto } from './dto/create-upload-token.dto';
import { FileService } from './file.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload-token')
  @Roles('teacher', 'student')
  createUploadToken(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateUploadTokenDto,
  ) {
    return this.fileService.createUploadToken(user.sub, dto);
  }

  @Get(':fileId/download')
  @Roles('teacher', 'student')
  async download(
    @CurrentUser() user: CurrentUserPayload,
    @Param('fileId') fileId: string,
    @Res() response: Response,
  ) {
    const file = await this.fileService.prepareDownload(user.sub, fileId);
    response.download(file.absolutePath, file.fileName);
  }
}
