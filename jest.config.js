module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/tables/'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/test/tsconfig.test.json',
    },
  },
};
