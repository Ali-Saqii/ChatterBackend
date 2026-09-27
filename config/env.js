const requiredProductionVariables = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLIENT_URL',
];

const validateEnvironment = () => {
  if (process.env.NODE_ENV !== 'production') return;

  const missingVariables = requiredProductionVariables.filter(
    (name) => !process.env[name]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missingVariables.join(', ')}`
    );
  }

  if (process.env.JWT_SECRET === 'change_this_to_a_long_random_string') {
    throw new Error('JWT_SECRET must be replaced with a unique production secret');
  }

  if (process.env.CLIENT_URL === '*') {
    throw new Error('CLIENT_URL must be a specific frontend origin in production');
  }
};

module.exports = { validateEnvironment };
