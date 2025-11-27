import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { DocRequest } from '@/common/doc/decorators/doc.decorator';
import { ResponseHttp } from '@/common/response/decorators/response.decorator';

import { Protected } from '../auth/decorators/protected.decorator';
import { EmailScheduleDto } from './dto/email-schedule.dto';
import { EmailSchedulingService } from './email-scheduling.service';

@Controller('email-scheduling')
@ApiTags('email-scheduling')
export class EmailSchedulingController {
  constructor(private readonly emailSchedulingService: EmailSchedulingService) {}

  @Post('schedule')
  @Protected()
  @DocRequest({ body: EmailScheduleDto })
  @ResponseHttp()
  async scheduleEmail(@Body() emailSchedule: EmailScheduleDto) {
    this.emailSchedulingService.scheduleEmail(emailSchedule);
  }

  @Post('schedule/cancel')
  @Protected()
  @ResponseHttp()
  async cancelScheduleEmail() {
    this.emailSchedulingService.cancelAllScheduledEmails();
  }
}
