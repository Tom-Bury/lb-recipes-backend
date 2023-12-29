import { NestMiddleware } from '@nestjs/common';
import bodyParser from 'body-parser';

type JsonBodyParserOpts = bodyParser.OptionsJson;

export class JsonBodyParserMiddleware implements NestMiddleware {
  private readonly options: JsonBodyParserOpts = {
    limit: '5mb',
  };

  use: NestMiddleware['use'] = bodyParser.json(this.options);
}
