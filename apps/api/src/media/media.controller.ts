import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req, Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';

type MediaRequestBody = { bucket?: string; path?: string; connectorId?: string };

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(@Inject(MediaService) private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: MediaRequestBody,
  ) {
    const organizationId = requireOrganizationId(req);
    return this.mediaService.uploadFile(organizationId, file, body);
  }

  @Get('url/:bucket/:key')
  getSignedUrl(
    @Req() req: AuthenticatedRequest,
    @Param('bucket') bucket: string,
    @Param('key') key: string,
    @Query('connectorId') connectorId?: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    const organizationId = requireOrganizationId(req);
    return this.mediaService.getDownloadUrl(
      organizationId,
      bucket,
      key,
      connectorId,
      expiresIn ? parseInt(expiresIn) : undefined,
    );
  }

  @Delete(':bucket/:key')
  deleteFile(
    @Req() req: AuthenticatedRequest,
    @Param('bucket') bucket: string,
    @Param('key') key: string,
    @Query('connectorId') connectorId?: string,
  ) {
    const organizationId = requireOrganizationId(req);
    return this.mediaService.deleteFile(
      organizationId,
      bucket,
      key,
      connectorId,
    );
  }
}
