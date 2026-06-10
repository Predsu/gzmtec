const requiredEnvVars = [
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_DBNAME',
  'DB_FRONTEND_URL',
  'JVM_HOST',
  'JVM_PORT'
];

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('× Missing required env variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }

  console.log('✔ All required env variables are set');


};

module.exports = validateEnvironment;
