/**
 * Integration Tests: API Output Validation
 * MBSS2.0-ApplicationCoding-004: Application output validation
 * 
 * Purpose: Validate API endpoint outputs match expected formats,
 * status codes, and business rules in realistic scenarios.
 */

import request from 'supertest';
import express, { Express } from 'express';
import { ResponseHandler } from '../../utils/response.handler';

describe('API Output Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock endpoints for testing
    app.get('/api/test/success', (_req, res) => {
      ResponseHandler.success(res, 'Operation successful', { id: '123' });
    });

    app.post('/api/test/create', (_req, res) => {
      ResponseHandler.created(res, 'Resource created', { id: 'new-123' });
    });

    app.get('/api/test/error', (_req, res) => {
      ResponseHandler.error(res, 'Something went wrong', 500);
    });

    app.get('/api/test/not-found', (_req, res) => {
      ResponseHandler.notFound(res, 'Resource not found');
    });

    app.post('/api/test/validation', (_req, res) => {
      ResponseHandler.validationError(res, { email: 'Invalid format' });
    });
  });

  describe('Success Response Outputs', () => {
    it('should output valid JSON with 200 status', async () => {
      const response = await request(app)
        .get('/api/test/success')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });

    it('should output created resource with 201 status', async () => {
      const response = await request(app)
        .post('/api/test/create')
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });
  });

  describe('Error Response Outputs', () => {
    it('should output server error with 500 status', async () => {
      const response = await request(app)
        .get('/api/test/error')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
    });

    it('should output not found with 404 status', async () => {
      const response = await request(app)
        .get('/api/test/not-found')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should output validation errors with 422 status', async () => {
      const response = await request(app)
        .post('/api/test/validation')
        .expect('Content-Type', /json/)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation');
    });
  });

  describe('Output Content Type Validation', () => {
    it('should always output application/json', async () => {
      const response = await request(app).get('/api/test/success');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Output Security Headers', () => {
    it('should not leak sensitive information in error outputs', async () => {
      const response = await request(app).get('/api/test/error');

      // Should not contain stack traces or internal paths
      expect(JSON.stringify(response.body)).not.toContain('node_modules');
      expect(JSON.stringify(response.body)).not.toContain('at Object');
      expect(JSON.stringify(response.body)).not.toContain('Error:');
    });
  });
});
