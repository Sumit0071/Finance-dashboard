"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
describe('Health Check', () => {
    it('GET /api/health — should return healthy status', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('healthy');
        expect(res.body.data).toHaveProperty('timestamp');
        expect(res.body.data).toHaveProperty('uptime');
    });
});
describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/non-existent-route');
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('NOT_FOUND');
    });
});
describe('Auth - Validation', () => {
    it('POST /api/auth/register — should reject missing fields', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({});
        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('POST /api/auth/register — should reject invalid email', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({ email: 'not-an-email', password: '123456', name: 'Test' });
        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
    });
    it('POST /api/auth/register — should reject short password', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({ email: 'test@test.com', password: '123', name: 'Test' });
        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
    });
    it('POST /api/auth/login — should reject missing fields', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({});
        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
});
describe('Protected Routes - Auth', () => {
    it('should reject requests without auth token', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/auth/profile');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
    it('should reject requests with invalid token', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/auth/profile')
            .set('Authorization', 'Bearer invalid-token');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
describe('Records - Validation', () => {
    it('POST /api/records — should reject unauthenticated requests', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/records')
            .send({ amount: 100, type: 'INCOME', category: 'Test', date: '2026-01-01' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
describe('Users - Access Control', () => {
    it('GET /api/users — should reject unauthenticated requests', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/users');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
describe('Dashboard - Access Control', () => {
    it('GET /api/dashboard/summary — should reject unauthenticated requests', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/dashboard/summary');
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
//# sourceMappingURL=api.test.js.map