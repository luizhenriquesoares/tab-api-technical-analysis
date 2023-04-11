module.exports = {
  type: 'sqlite',
  database: 'data.sqlite',
  synchronize: true,
  logging: true,
  entities: ['src/modules/**/*entity{.ts,.js}'],
  migrations: ['./db/migrations/**/*{.ts,.js}'],
  subscribers: ['./db/subscribers/**/*{.ts,.js}'],
  cli: {
    entitiesDir: './db/migrations/entities',
    migrationsDir: './db/migrations',
    subscribersDir: './db/subscribers',
  },
};
