import {
  Body,
  Controller,
  Inject,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  AuthenticatedRequest,
  getOptionalUserId,
  requireOrganizationId,
} from '../common/request-context';
import { requireOperationsWriteAccess } from './operations-access';
import {
  ActivatePanicProtocolDto,
  ApprovalListQueryDto,
  CreateApprovalRequestDto,
  CreateCommitmentDto,
  CreateIncidentDto,
  CreateOperationsTaskDto,
  CreateWorkLogDto,
  DecideApprovalRequestDto,
  OperationsListQueryDto,
  UpdateIncidentDto,
} from './operations.dto';
import { requireOperationsCoreEnabled } from './operations-feature';
import { OperationsService } from './operations.service';

@Controller('operations')
@UseGuards(JwtAuthGuard)
export class OperationsController {
  constructor(@Inject(OperationsService) private readonly operations: OperationsService) {}

  @Get('summary')
  summary(@Request() req: AuthenticatedRequest) {
    requireOperationsCoreEnabled();
    return this.operations.getDailySummary(requireOrganizationId(req));
  }

  @Get('incidents')
  listIncidents(
    @Request() req: AuthenticatedRequest,
    @Query() query: OperationsListQueryDto,
  ) {
    requireOperationsCoreEnabled();
    return this.operations.listIncidents(requireOrganizationId(req), query);
  }

  @Post('incidents')
  createIncident(
    @Request() req: AuthenticatedRequest,
    @Body() data: CreateIncidentDto,
  ) {
    requireOperationsCoreEnabled();
    requireOperationsWriteAccess(req);
    return this.operations.createIncident(
      requireOrganizationId(req),
      getOptionalUserId(req),
      data,
    );
  }

  @Patch('incidents/:id')
  updateIncident(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateIncidentDto,
  ) {
    requireOperationsCoreEnabled();
    requireOperationsWriteAccess(req);
    return this.operations.updateIncident(
      requireOrganizationId(req),
      getOptionalUserId(req),
      id,
      data,
    );
  }

  @Post('tasks')
  createTask(
    @Request() req: AuthenticatedRequest,
    @Body() data: CreateOperationsTaskDto,
  ) {
    requireOperationsCoreEnabled();
    requireOperationsWriteAccess(req);
    return this.operations.createTask(
      requireOrganizationId(req),
      getOptionalUserId(req),
      data,
    );
  }

  @Post('commitments')
  createCommitment(
    @Request() req: AuthenticatedRequest,
    @Body() data: CreateCommitmentDto,
  ) {
    requireOperationsCoreEnabled();
    requireOperationsWriteAccess(req);
    return this.operations.createCommitment(
      requireOrganizationId(req),
      getOptionalUserId(req),
      data,
    );
  }

  @Post('approvals')
  createApprovalRequest(
    @Request() req: AuthenticatedRequest,
    @Body() data: CreateApprovalRequestDto,
  ) {
    requireOperationsCoreEnabled();
    requireOperationsWriteAccess(req);
    return this.operations.createApprovalRequest(
      requireOrganizationId(req),
      getOptionalUserId(req),
      data,
    );
  }

  @Get('approvals')
  listApprovalRequests(
    @Request() req: AuthenticatedRequest,
    @Query() query: ApprovalListQueryDto,
  ) {
    requireOperationsCoreEnabled();
    return this.operations.listApprovalRequests(requireOrganizationId(req), query);
  }

  @Patch('approvals/:id')
  decideApprovalRequest(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: DecideApprovalRequestDto,
  ) {
    requireOperationsCoreEnabled();
    requireOperationsWriteAccess(req);
    return this.operations.decideApprovalRequest(
      requireOrganizationId(req),
      getOptionalUserId(req),
      id,
      data,
    );
  }

  @Post('panic')
  activatePanicProtocol(
    @Request() req: AuthenticatedRequest,
    @Body() data: ActivatePanicProtocolDto,
  ) {
    requireOperationsCoreEnabled();
    requireOperationsWriteAccess(req);
    return this.operations.activatePanicProtocol(
      requireOrganizationId(req),
      getOptionalUserId(req),
      data,
    );
  }

  @Post('work-logs')
  createWorkLog(
    @Request() req: AuthenticatedRequest,
    @Body() data: CreateWorkLogDto,
  ) {
    requireOperationsCoreEnabled();
    requireOperationsWriteAccess(req);
    return this.operations.createWorkLog(
      requireOrganizationId(req),
      getOptionalUserId(req),
      data,
    );
  }
}
