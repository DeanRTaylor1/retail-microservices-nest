import { randomBytes } from 'crypto';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users', synchronize: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  username: string;

  @Column({ length: 100 })
  email: string;

  @Column({ select: false })
  password: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  static createRandomUser(): User {
    const user = new User();
    user.username = User.generateRandomString(10);
    user.email = `${User.generateRandomString(5)}@example.com`;
    user.password = User.generateRandomString(12);
    return user;
  }

  static generateRandomString(length: number): string {
    return randomBytes(length).toString('hex').substring(0, length);
  }
}
