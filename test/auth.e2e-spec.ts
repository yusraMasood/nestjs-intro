import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestSetup } from './utils/test-setup';

describe('AppController (e2e)', () => {
  let testSetup: TestSetup;

  beforeEach(async () => {
    testSetup = await TestSetup.create(AppModule);
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  const testUser = {
    email: 'pirha@gmail.com',
    password: 'Admin@123',
    name: 'pirha',
  };
  it('/auth/register (POST)', () => {
    return request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        const body = res.body as { email: string; name: string };
        expect(body.email).toBe(testUser.email);
        expect(body.name).toBe(testUser.name);
        expect(body).not.toHaveProperty('password');
      });
  });
  it('/auth/register (POST) - duplicate email', async () => {
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser);
    return await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(409);
  });
  it('/auth/login (POST)', async () => {
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser);
    const response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'pirha@gmail.com',
        password: 'Admin@123',
      });
    console.log('response', response?.body);
    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeDefined();
  });
});
