import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configs } from './config/interfaces/config.interface';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService<Configs, true>) {}

  @Get()
  getRoot(): string {
    return this.configService.get('version');
  }
}
