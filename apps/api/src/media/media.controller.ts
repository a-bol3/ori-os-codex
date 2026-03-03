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
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { bucket?: string; path?: string; connectorId?: string },
  ) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.mediaService.uploadFile(organizationId, file, body);
  }

  @Get('url/:bucket/:key')
  getSignedUrl(
    @Req() req: any,
    @Param('bucket') bucket: string,
    @Param('key') key: string,
    @Query('connectorId') connectorId?: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
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
    @Req() req: any,
    @Param('bucket') bucket: string,
    @Param('key') key: string,
    @Query('connectorId') connectorId?: string,
  ) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.mediaService.deleteFile(
      organizationId,
      bucket,
      key,
      connectorId,
    );
  }
}
