const ApiResponse = require('../utils/ApiResponse');

describe('ApiResponse', () => {
  test('keeps response data and message in their documented fields', () => {
    const response = new ApiResponse(200, { token: 'example' }, 'Logged in');

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ token: 'example' });
    expect(response.message).toBe('Logged in');
    expect(response.success).toBe(true);
  });
});