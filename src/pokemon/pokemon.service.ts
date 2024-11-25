import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pokemon } from './entities/pokemon.entity';
import { RedisService } from '../redis/redis.service';
import { fetchPokemonData, fetchSpeciesData, fetchCharacteristics, getPokemonFields } from './pokemon.helpers';
import { POKEMON_FETCH_FAIL, POKEMON_NOT_FOUND, REDIS_TTL } from 'src/constants';

@Injectable()
export class PokemonService {
  constructor(
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
    private readonly redisService: RedisService,
  ) {}

  async getAllPokemon(): Promise<Pokemon[]> {
    const cacheKey = 'all_pokemon';
  
    const cachedPokemon = await this.redisService.getCache(cacheKey);
    if (cachedPokemon) {
      return JSON.parse(cachedPokemon);
    }
  
    const allPokemon = await this.pokemonRepository.find();
    if (!allPokemon) {
      throw new Error(POKEMON_NOT_FOUND);
    }
  
    await this.redisService.setCache(cacheKey, JSON.stringify(allPokemon), REDIS_TTL);
  
    return allPokemon;
  }
  

  async getPokemonById(pokemonId: number): Promise<Pokemon> {
    const cacheKey = `pokemon:${pokemonId}`;

    const cachedPokemon = await this.redisService.getCache(cacheKey);
    if (cachedPokemon) {
      return JSON.parse(cachedPokemon);
    }

    let pokemon = await this.pokemonRepository.findOne({ where: { cybereason_pokemon_id: pokemonId } });
    if (!pokemon) {
      const [pokemonData, speciesData, characteristicsResult] = await Promise.allSettled([
        fetchPokemonData(pokemonId),
        fetchSpeciesData(pokemonId),
        fetchCharacteristics(pokemonId),
      ]);

      if (pokemonData.status === 'fulfilled' && speciesData.status === 'fulfilled') {

        const { name, types, eggGroups, characteristics } = getPokemonFields(pokemonData.value, speciesData.value, characteristicsResult)

          pokemon = this.pokemonRepository.create({
            cybereason_pokemon_id: pokemonId,
            cybereason_nickname: name,
            name,
            types,
            egg_groups: eggGroups,
            characteristics: characteristics
              ? {
                  gene_modulo: characteristics.gene_modulo,
                  description: characteristics.description,
                }
              : null
          });
          
          

        await this.pokemonRepository.save(pokemon);
      } else {
        throw new Error(POKEMON_FETCH_FAIL);
      }
    }

    await this.redisService.setCache(cacheKey, JSON.stringify(pokemon), REDIS_TTL);

    return pokemon;
  }

  async updateNickname(pokemonId: number, newNickname: string): Promise<Pokemon> {
    const pokemon = await this.getPokemonById(pokemonId);
    if (!pokemon) {
        throw new Error(`${POKEMON_NOT_FOUND}: ${pokemonId}`);
    }

    pokemon.cybereason_nickname = newNickname;
    await this.pokemonRepository.save(pokemon);

    const cacheKey = `pokemon:${pokemonId}`;
    await this.redisService.setCache(cacheKey, JSON.stringify(pokemon), 3600);

    return pokemon;
  }

  async deletePokemon(pokemonId: number): Promise<boolean> {
    const pokemon = await this.pokemonRepository.findOne({
        where: { id: pokemonId },
      });
    if (!pokemon) {
        throw new Error(`${POKEMON_NOT_FOUND}: ${pokemonId}`);
    }

    await this.redisService.deleteCache(`pokemon:${pokemonId}`);

    await this.pokemonRepository.remove(pokemon);

    return true;
  }

}
