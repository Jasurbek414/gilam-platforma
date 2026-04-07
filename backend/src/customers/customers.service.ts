import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    // Uniqueness check: avoid duplicate phone numbers within the same company
    const existing = await this.customerRepository.findOne({
      where: { 
        companyId: dto.companyId,
        phone1: dto.phone1
      }
    });

    if (existing) {
      // If customer exists, we can either return it or throw an error.
      // For a seamless operator experience, let's return the existing one or throw a ConflictException.
      throw new ConflictException(`Ushbu telefon raqamli mijoz (${dto.phone1}) allaqachon mavjud.`);
    }

    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }

  async findAllByCompany(companyId: string): Promise<Customer[]> {
    return this.customerRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!customer) {
      throw new NotFoundException(`Mijoz #${id} topilmadi`);
    }
    return customer;
  }

  async search(companyId: string, query: string): Promise<Customer[]> {
    return this.customerRepository
      .createQueryBuilder('c')
      .where('c.company_id = :companyId', { companyId })
      .andWhere(
        '(c.full_name ILIKE :q OR c.phone_1 ILIKE :q OR c.phone_2 ILIKE :q)',
        { q: `%${query}%` },
      )
      .orderBy('c.full_name', 'ASC')
      .getMany();
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }
}
