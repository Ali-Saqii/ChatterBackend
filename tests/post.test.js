const Like = require('../models/Like');

describe('Like model', () => {
  test('defines a unique user and post index', () => {
    const index = Like.schema.indexes().find(([fields, options]) => (
      fields.user === 1 && fields.post === 1 && options.unique === true
    ));

    expect(index).toBeDefined();
  });
});