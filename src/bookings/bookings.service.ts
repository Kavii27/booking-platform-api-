import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus } from './enums/booking-status.enum';
import { ServicesService } from '../services/services.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private servicesService: ServicesService,
  ) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    // Rule: booking must belong to an existing service
    await this.servicesService.findOne(dto.serviceId); // throws NotFoundException if missing

    // Rule: booking date cannot be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(dto.bookingDate);
    if (bookingDate < today) {
      throw new BadRequestException('Booking date cannot be in the past');
    }

    const booking = this.bookingsRepository.create(dto);
    return this.bookingsRepository.save(booking);
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;
    const [data, total] = await this.bookingsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    return booking;
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto): Promise<Booking> {
    const booking = await this.findOne(id);

    // Rule: cancelled bookings cannot be marked as completed
    if (booking.status === BookingStatus.CANCELLED && dto.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cancelled bookings cannot be marked as completed');
    }

    booking.status = dto.status;
    return this.bookingsRepository.save(booking);
  }

  async cancel(id: string): Promise<Booking> {
    const booking = await this.findOne(id);

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Completed bookings cannot be cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    return this.bookingsRepository.save(booking);
  }
}