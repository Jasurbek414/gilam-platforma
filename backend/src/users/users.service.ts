import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { phone },
      relations: ['company'],
    });
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

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByPhone(dto.phone);
    if (existing) {
      throw new ConflictException(
        `Bu telefon raqam allaqachon ro'yxatdan o'tgan: ${dto.phone}`,
      );
    }

    const salt = await bcrypt.genSalt(10);
    const rawPassword = dto.password || '123456';
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const user = this.usersRepository.create({
      fullName: dto.fullName,
      phone: dto.phone,
      role: dto.role as UserRole,
      companyId: dto.companyId as any,
      status: UserStatus.ACTIVE,
      passwordHash,
    });

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
    
    if (dto.companyId !== undefined) {
      // @ts-ignore
      user.companyId = dto.companyId;
    }

    return this.usersRepository.save(user);
  }

  async updatePushToken(id: string, token: string): Promise<void> {
    await this.usersRepository.update(id, { expoPushToken: token });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.status = UserStatus.DELETED;
    await this.usersRepository.save(user);
    await this.usersRepository.softRemove(user);
  }
}
