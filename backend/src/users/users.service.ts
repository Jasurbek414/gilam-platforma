import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone }, relations: ['company'] });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!user) {
      throw new NotFoundException(`Foydalanuvchi #${id} topilmadi`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['company'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByCompany(companyId: string): Promise<User[]> {
    return this.usersRepository.find({
      where: { companyId },
      relations: ['company'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({
      where: { role },
      relations: ['company'],
    });
  }

  async create(userData: Partial<User> & { password?: string }): Promise<User> {
    // Telefon dublikatini tekshirish
    if (userData.phone) {
      const existing = await this.findByPhone(userData.phone);
      if (existing) {
        throw new ConflictException(`Bu telefon raqam allaqachon ro'yxatdan o'tgan: ${userData.phone}`);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const rawPassword = (userData as any).password || userData.passwordHash || '123456';
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const user = this.usersRepository.create({
      ...userData,
      passwordHash,
      role: userData.role || UserRole.CUSTOMER,
    });

    // password fieldni tozalash (entity da yo'q)
    delete (user as any).password;

    return this.usersRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Agar parol o'zgartirilsa, hash qilish
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(dto.password, salt);
    }

    // Boshqa fieldlarni yangilash
    if (dto.fullName) user.fullName = dto.fullName;
    if (dto.phone) user.phone = dto.phone;
    if (dto.role) user.role = dto.role;
    if (dto.status) user.status = dto.status;
    if (dto.companyId !== undefined) user.companyId = dto.companyId;

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
