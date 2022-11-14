import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class StringQuery {
  @IsNotEmpty()
  @IsString()
  query!: string;
}

export class StringArrayQuery {
  @ArrayNotEmpty()
  @IsNotEmpty({
    each: true,
  })
  @IsString({
    each: true,
  })
  query!: string[];
}
