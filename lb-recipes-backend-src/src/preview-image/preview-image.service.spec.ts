import { Test, TestingModule } from '@nestjs/testing';
import { PreviewImageService } from './preview-image.service';

describe('PreviewImageService', () => {
  let service: PreviewImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreviewImageService],
    }).compile();

    service = module.get<PreviewImageService>(PreviewImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
