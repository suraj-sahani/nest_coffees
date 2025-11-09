import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';

@Injectable()
export class CoffeesService {

  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>
  ) { }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery
    return await this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit
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
    const flavors = await Promise.all(newCoffeeDto.flavors.map(name => this.preloadFlavorByName(name)))
    const coffee = this.coffeeRepository.create({ ...newCoffeeDto, flavors })
    const savedCoffee = await this.coffeeRepository.save(coffee)
    return savedCoffee
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors = updateCoffeeDto.flavors &&
      (await Promise.all(updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))))

    const existingCoffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto, flavors
    })

    if (!existingCoffee) throw new NotFoundException(`Coffee ${id} not found.`)

    const updatedCoffee = await this.coffeeRepository.update(id, existingCoffee)

    return updatedCoffee
  }

  async delete(id: string) {
    const coffee = await this.coffeeRepository.findOneBy({ id: +id })

    if (!coffee) throw new NotFoundException(`Coffee ${id} not found.`)

    const deleted = this.coffeeRepository.delete(id)

    return deleted
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name }
    })

    // Return the flavor if already exists 
    if (existingFlavor) return existingFlavor
    //If it does not exist, create a new flavor
    const newFlavor = this.flavorRepository.create({ name })

    return this.flavorRepository.save(newFlavor)
  }

}
