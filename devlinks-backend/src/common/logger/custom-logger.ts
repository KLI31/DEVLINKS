import { ConsoleLogger } from '@nestjs/common';

export class CustomLogger extends ConsoleLogger {
  log(message: unknown, context?: string) {
    if (context === 'Bootstrap') {
      super.log(message, context);
    }
  }

  debug(_message: unknown, _context?: string) {
    return;
  }

  verbose(_message: unknown, _context?: string) {
    return;
  }
}
