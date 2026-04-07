import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ name: 'phone_1', length: 50 })
  phone1: string;

  @Column({ name: 'phone_2', length: 50, nullable: true })
  phone2: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'point', nullable: true })
  location: any;

  @Column({ name: 'operator_id', type: 'uuid', nullable: true })
  operatorId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
