// config/environment.js
const environment = {
    development: {
      port: process.env.PORT || 3001,
      database: process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-donation-dev',
      jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      jwtExpire: process.env.JWT_EXPIRE || '30d',
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      logLevel: 'debug'
    },
    production: {
      port: process.env.PORT || 3001,
      database: process.env.MONGODB_URI,
      jwtSecret: process.env.JWT_SECRET,
      jwtExpire: process.env.JWT_EXPIRE || '7d',
      corsOrigin: process.env.CORS_ORIGIN,
      logLevel: 'error'
    },
    test: {
      port: process.env.PORT || 3002,
      database: process.env.MONGODB_URI || 'mongodb://localhost:27017/blood-donation-test',
      jwtSecret: 'test-secret-key',
      jwtExpire: '1h',
      corsOrigin: 'http://localhost:3000',
      logLevel: 'error'
    }
  };
  
  const getConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    return environment[env];
  };
  
  export default getConfig;