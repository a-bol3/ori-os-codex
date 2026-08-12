import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Request,
  UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AlertsService } from './alerts.service';
import { CreateAlertDto, UpdateAlertDto, GetAlertsDto } from './dto/alert.dto';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';

@Controller('seo/projects/:projectId/alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(@Inject(AlertsService) private readonly alertsService: AlertsService) {}

  @Post()
  async createAlert(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @Body() dto: CreateAlertDto,
  ) {
    return this.alertsService.createAlert(
      projectId,
      requireOrganizationId(req),
      dto,
    );
  }

  @Get()
  async getAlerts(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @Query() query: GetAlertsDto,
  ) {
    return this.alertsService.getAlerts(
      projectId,
      requireOrganizationId(req),
      query,
    );
  }

  @Get('summary')
  async getAlertsSummary(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
  ) {
    return this.alertsService.getAlertsSummary(
      projectId,
      requireOrganizationId(req),
    );
  }

  @Get(':alertId')
  async getAlert(
    @Request() req: AuthenticatedRequest,
    @Param('alertId') alertId: string,
  ) {
    return this.alertsService.getAlertById(
      alertId,
      requireOrganizationId(req),
    );
  }

  @Put(':alertId')
  async updateAlert(
    @Request() req: AuthenticatedRequest,
    @Param('alertId') alertId: string,
    @Body() dto: UpdateAlertDto,
  ) {
    return this.alertsService.updateAlert(
      alertId,
      requireOrganizationId(req),
      dto,
    );
  }

  @Delete(':alertId')
  async deleteAlert(
    @Request() req: AuthenticatedRequest,
    @Param('alertId') alertId: string,
  ) {
    return this.alertsService.deleteAlert(
      alertId,
      requireOrganizationId(req),
    );
  }

  @Post('mark-all-read')
  async markAllAsRead(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
  ) {
    return this.alertsService.markAllAsRead(
      projectId,
      requireOrganizationId(req),
    );
  }
}
