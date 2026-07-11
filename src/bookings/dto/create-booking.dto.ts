import { IsString, IsEmail, IsUUID, IsDateString, Matches, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  customerPhone: string;

  @IsUUID()
  serviceId: string;

  @IsDateString()
  bookingDate: string; // e.g. "2026-08-01"

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'bookingTime must be in HH:mm format (24-hour)',
  })
  bookingTime: string; // e.g. "14:30"

  @IsOptional()
  @IsString()
  notes?: string;
}