import type { Twilio } from 'twilio';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import client from 'twilio';

import { ITwilioConfig } from '@/common/app-config/interfaces/twilio.config.interface';

@Injectable()
export class TwilioService {
  private readonly twilioClient: Twilio;

  private readonly notificationPhoneNumber: string;

  private readonly logger = new Logger(TwilioService.name);

  constructor(private readonly configService: ConfigService) {
    const twilioConfig = configService.get('twilio') as ITwilioConfig;
    this.twilioClient = client(twilioConfig.accountSid, twilioConfig.authToken);
    this.notificationPhoneNumber = twilioConfig.number;
  }

  async sendSms(to: string, body: string) {
    try {
      await this.twilioClient.messages.create({
        body,
        from: this.notificationPhoneNumber,
        to,
      });
    } catch (error) {
      // TODO: Add proper error handling
      console.info(error);
    }
  }

  async sendWhatsapp(to: string, body: string) {
    try {
      await this.twilioClient.messages.create({
        body,
        from: `whatsapp:${this.notificationPhoneNumber}`,
        to: `whatsapp:${to}`,
      });
    } catch (error) {
      // TODO: Add proper error handling
      console.info(error);
    }
  }

  async sendCall(to: string, body: string) {
    try {
      await this.twilioClient.calls.create({
        twiml: `<Response><Say>${body}</Say></Response>`,
        to,
        from: this.notificationPhoneNumber,
      });
    } catch (error) {
      // TODO: Add proper error handling
      console.info(error);
    }
  }
}
