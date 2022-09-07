import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Type } from './entities/type.entity';

@Injectable()
export class TypeService {
  constructor(
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>
  ) {}

  async findAll(app: string): Promise<Type[]> {    
    if (app === 'true') {
      return await this.typeRepository.find({ where: { app: 1 } })
    }

    return await this.typeRepository.find();
  }

  async findOne(id: number): Promise<Type> {
    return await this.typeRepository.findOne({ where: { id: id } });
  }
}
