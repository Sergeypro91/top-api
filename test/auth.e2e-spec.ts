import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { AuthDto } from '../src/auth/dto/auth.dto';

const loginDto: AuthDto = {
	login: 'test@mail.ru',
	password: '12345678',
};

describe('AuthController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/auth/login (POST) - success', async () => {
		try {
			return request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(200)
				.then(({ body }: request.Response) => {
					expect(body.access_token).toBeDefined();
				});
		} catch (err) {
			console.log(err);
		}
	});

	it('/auth/login (POST) - failed login', async () => {
		try {
			return request(app.getHttpServer())
				.post('/auth/login')
				.send({ ...loginDto, login: 'wrong' })
				.expect(401, {
					statusCode: 401,
					message: 'Пользователь не найден',
					error: 'Unauthorized',
				});
		} catch (err) {
			console.log(err);
		}
	});

	it('/auth/login (POST) - failed password', async () => {
		try {
			return request(app.getHttpServer())
				.post('/auth/login')
				.send({ ...loginDto, password: 'wrong' })
				.expect(401, {
					statusCode: 401,
					message: 'Неверный пароль',
					error: 'Unauthorized',
				});
		} catch (err) {
			console.log(err);
		}
	});
});
