import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CoffeesService {

  constructor(@InjectRepository(Coffee)
  private readonly coffeeRepository: Repository<Coffee>
  ) { }

  async findAll() {
    return await this.coffeeRepository.find({
      relations: ['flavors']
    })
  }

  async findOne(id: string) {
    const searchedCoffee = await this.coffeeRepository.findOne({
      where: {
        id: +id
      }, relations: ['flavors']
    })

    if (!searchedCoffee) {
      throw new NotFoundException('Coffee not found')
    }

    return searchedCoffee
  }

  async create(newCoffeeDto: CreateCoffeeDto) {
    const coffee = this.coffeeRepository.create(newCoffeeDto)
    const savedCoffee = await this.coffeeRepository.save(coffee)
    return coffee
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const existingCoffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto
    })

    if (!existingCoffee) throw new NotFoundException(`Coffee ${id} not found.`)

    const updatedCoffee = await this.coffeeRepository.update(id, updateCoffeeDto)

    return updatedCoffee
  }

  async delete(id: string) {
    const coffee = await this.coffeeRepository.findOneBy({ id: +id })

    if (!coffee) throw new NotFoundException(`Coffee ${id} not found.`)

    const deleted = this.coffeeRepository.delete(id)

    return deleted
  }
}
