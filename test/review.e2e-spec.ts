import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { CreateReviewDto } from '../src/review/dto/create-review.dto';
import { Types, disconnect } from 'mongoose';
import { REVIEW_NOT_FOUND } from '../src/review/review.constants';

const productId = new Types.ObjectId().toHexString();

const testDto: CreateReviewDto = {
	name: 'Тест',
	title: 'Заголовок',
	description: 'Тестовое описание',
	rating: 5,
	productId,
};

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let createdId: string;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	it('/review/create (POST) - success', async () => {
		try {
			return request(app.getHttpServer())
				.post('/review/create')
				.send(testDto)
				.expect(201)
				.then(({ body }: request.Response) => {
					createdId = body._id;
					expect(createdId).toBeDefined();
					console.log(productId);
				});
		} catch (err) {
			console.log(err);
		}
	});

	it('/review/create (POST) - failed', async () => {
		try {
			return request(app.getHttpServer())
				.post('/review/create')
				.send({ ...testDto, rating: 0 })
				.expect(400)
				.then(({ body }: request.Response) => {
					console.log(body);
				});
		} catch (err) {
			console.log(err);
		}
	});

	it('/review/byProduct/:productId (GET) - success', async () => {
		try {
			return request(app.getHttpServer())
				.get('/review/byProduct/' + productId)
				.expect(200)
				.then(({ body }: request.Response) => {
					expect(body.length).toBe(1);
				});
		} catch (err) {
			console.log(err);
		}
	});

	it('/review/byProduct/:productId (GET) - failed', async () => {
		try {
			return request(app.getHttpServer())
				.get('/review/byProduct/' + new Types.ObjectId().toHexString())
				.expect(200)
				.then(({ body }: request.Response) => {
					expect(body.length).toBe(0);
				});
		} catch (err) {
			console.log(err);
		}
	});

	it('/review/:id (DELETE) - success', () => {
		return request(app.getHttpServer())
			.delete('/review/' + createdId)
			.expect(200);
	});

	it('/review/:id (DELETE) - failed', () => {
		return request(app.getHttpServer())
			.delete('/review/' + new Types.ObjectId().toHexString())
			.expect(404, {
				statusCode: 404,
				message: REVIEW_NOT_FOUND,
			});
	});

	afterAll(() => {
		disconnect();
	});
});
