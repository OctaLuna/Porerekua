import { Injectable } from '@nestjs/common';
import { CreateComunidadesIndigenaDto } from '../dto/create-comunidades-indigena.dto';
import { UpdateComunidadesIndigenaDto } from '../dto/update-comunidades-indigena.dto';

@Injectable()
export class ComunidadesIndigenasService {
  create(createComunidadesIndigenaDto: CreateComunidadesIndigenaDto) {
    return 'This action adds a new comunidadesIndigena';
  }

  findAll() {
    return `This action returns all comunidadesIndigenas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comunidadesIndigena`;
  }

  update(id: number, updateComunidadesIndigenaDto: UpdateComunidadesIndigenaDto) {
    return `This action updates a #${id} comunidadesIndigena`;
  }

  remove(id: number) {
    return `This action removes a #${id} comunidadesIndigena`;
  }
}
