import { Controller, Get } from '@nestjs/common';
@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    return " this backend is running on port 8000 on ip address of namecheap vps also on api.izubagen.rw";
  }
}
