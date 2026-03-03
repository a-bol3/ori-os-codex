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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AlertsService } from './alerts.service';
import { CreateAlertDto, UpdateAlertDto, GetAlertsDto } from './dto/alert.dto';

@Controller('seo/projects/:projectId/alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  async createAlert(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() dto: CreateAlertDto,
  ) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.alertsService.createAlert(projectId, orgId, dto);
  }

  @Get()
  async getAlerts(
    @Request() req,
    @Param('projectId') projectId: string,
    @Query() query: GetAlertsDto,
  ) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.alertsService.getAlerts(projectId, orgId, query);
  }

  @Get('summary')
  async getAlertsSummary(
    @Request() req,
    @Param('projectId') projectId: string,
  ) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.alertsService.getAlertsSummary(projectId, orgId);
  }

  @Get(':alertId')
  async getAlert(@Request() req, @Param('alertId') alertId: string) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.alertsService.getAlertById(alertId, orgId);
  }

  @Put(':alertId')
  async updateAlert(
    @Request() req,
    @Param('alertId') alertId: string,
    @Body() dto: UpdateAlertDto,
  ) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.alertsService.updateAlert(alertId, orgId, dto);
  }

  @Delete(':alertId')
  async deleteAlert(@Request() req, @Param('alertId') alertId: string) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.alertsService.deleteAlert(alertId, orgId);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Request() req, @Param('projectId') projectId: string) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.alertsService.markAllAsRead(projectId, orgId);
  }
}
