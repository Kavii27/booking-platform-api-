import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Service } from './services/entities/service.entity';
import { Booking } from './bookings/entities/booking.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Service, Booking],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // migrations control schema now, not auto-sync
});