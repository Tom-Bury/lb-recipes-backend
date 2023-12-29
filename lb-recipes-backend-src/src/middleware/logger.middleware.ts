import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request:', req.method, req.originalUrl, req.body);
    console.log('Response: HTTP', res.statusCode, req.originalUrl, req.body);
    next();
  }
}
