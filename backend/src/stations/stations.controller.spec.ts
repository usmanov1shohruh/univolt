import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { StationsModule } from './stations.module';

describe('StationsController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [StationsModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /stations returns { items, total }', async () => {
    const res = await request(app.getHttpServer())
      .get('/stations')
      .expect(200);

    expect(Array.isArray(res.body.items)).toBe(true);
    expect(typeof res.body.total).toBe('number');
  });

  it('GET /stations with bbox filters stations', async () => {
    const res = await request(app.getHttpServer())
      .get('/stations?minLat=41.25&minLon=69.0&maxLat=41.45&maxLon=69.5')
      .expect(200);

    expect(typeof res.body.total).toBe('number');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeLessThanOrEqual(res.body.total);
  });

  it('GET /stations rejects invalid bbox params', async () => {
    const res = await request(app.getHttpServer())
      .get('/stations?minLat=abc')
      .expect(400);

    expect(res.body).toBeDefined();
  });
});

