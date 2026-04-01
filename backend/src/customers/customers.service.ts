import { Injectable, NotFoundException } from '@nestjs/common';
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
