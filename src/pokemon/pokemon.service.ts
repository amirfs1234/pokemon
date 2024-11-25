import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pokemon } from './entities/pokemon.entity';
import { RedisService } from '../redis/redis.service';
import { CreatePokemonDto, UpdatePokemonDto } from './dto';

@Injectable()
export class PokemonService {
  private readonly cacheExpiry = 3600;

  constructor(
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
    private readonly redisService: RedisService,
  ) {}

  async getAllPokemon(): Promise<Pokemon[]> {
    const cacheKey = 'pokemon:all';
    const cachedData = await this.redisService.getCache(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const pokemons = await this.pokemonRepository.find();
    await this.redisService.setCache(cacheKey, JSON.stringify(pokemons), this.cacheExpiry);

    return pokemons;
  }

  async getPokemonById(id: number): Promise<Pokemon> {
    const cacheKey = `pokemon:${id}`;
    const cachedData = await this.redisService.getCache(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const pokemon = await this.pokemonRepository.findOneBy({ id });

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
    }

    await this.redisService.setCache(cacheKey, JSON.stringify(pokemon), this.cacheExpiry);

    return pokemon;
  }

  async createPokemon(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    const newPokemon = this.pokemonRepository.create(createPokemonDto);
    const savedPokemon = await this.pokemonRepository.save(newPokemon);

    await this.redisService.deleteCache('pokemon:all');

    return savedPokemon;
  }

  async updatePokemon(id: number, updateData: UpdatePokemonDto): Promise<Pokemon> {
    const pokemon = await this.getPokemonById(id);

    Object.assign(pokemon, updateData);
    const updatedPokemon = await this.pokemonRepository.save(pokemon);

    await this.redisService.setCache(
      `pokemon:${id}`,
      JSON.stringify(updatedPokemon),
      this.cacheExpiry,
    );
    await this.redisService.deleteCache('pokemon:all');

    return updatedPokemon;
  }

  async deletePokemon(id: number): Promise<void> {
    const result = await this.pokemonRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
    }

    await this.redisService.deleteCache(`pokemon:${id}`);
    await this.redisService.deleteCache('pokemon:all');
  }
}
