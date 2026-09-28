const { validateEnvironment } = require('../config/env');

describe('validateEnvironment', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test('does nothing outside production', () => {
    process.env.NODE_ENV = 'development';

    expect(() => validateEnvironment()).not.toThrow();
  });

  test('requires the production variables before startup', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.MONGODB_URI;
    delete process.env.JWT_SECRET;
    delete process.env.CLIENT_URL;

    expect(() => validateEnvironment()).toThrow(
      'Missing required production environment variables: MONGODB_URI, JWT_SECRET, CLIENT_URL'
    );
  });

  test('rejects placeholder JWT secrets and wildcard client origins', () => {
    process.env.NODE_ENV = 'production';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/chatter';
    process.env.JWT_SECRET = 'change_this_to_a_long_random_string';
    process.env.CLIENT_URL = '*';

    expect(() => validateEnvironment()).toThrow(
      'JWT_SECRET must be replaced with a unique production secret'
    );
  });

  test('accepts a valid production environment', () => {
    process.env.NODE_ENV = 'production';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/chatter';
    process.env.JWT_SECRET = 'a-very-long-and-random-production-secret';
    process.env.CLIENT_URL = 'https://app.example.com';

    expect(() => validateEnvironment()).not.toThrow();
  });
});
