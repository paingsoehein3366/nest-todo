import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scypt = promisify(_scrypt);

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) { }

  findAll(email: string) {
    return this.repo.find({ where: { email } });
  }

  findOne(id: number) {
    if (!id) {
      return null;
    }
    return this.repo.findOneBy({ id });
  }

  async create(email: string, password: string) {
    const user = await this.repo.findOne({ where: { email } });
    if (user) {
      throw new BadRequestException('User already exists');
    }
    const salt = randomBytes(8).toString('hex');
    const hash = (await scypt(password, salt, 32)) as Buffer;
    const result = salt + "." + hash.toString('hex');

    return this.repo.save({ email, password: result });
  }

  async signin(email: string, password: string) {
    const user = await this.repo.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    const [salt, storedHash] = user.password.split('.');
    const hash = (await scypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Incorrect password');
    }
    return user;
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    if (attrs.password) {
      const [salt, storedHash] = user.password.split('.');
      const hash = (await scypt(attrs.password, salt, 32)) as Buffer;
      const result = salt + "." + hash.toString('hex');
      attrs.password = result;
    }
    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  async delete(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    return this.repo.remove(user);
  }
}
