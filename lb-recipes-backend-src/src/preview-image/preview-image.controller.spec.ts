import { Test, TestingModule } from '@nestjs/testing';
import { PreviewImageController } from './preview-image.controller';

describe('PreviewImageController', () => {
  let controller: PreviewImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreviewImageController],
    }).compile();

    controller = module.get<PreviewImageController>(PreviewImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
