import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pokemon } from './entities/pokemon.entity';
import { RedisService } from '../redis/redis.service';
import { fetchPokemonData, fetchSpeciesData, fetchCharacteristics, getPokemonFields, handleAllRedisSettingsForPokemon } from './pokemon.helpers';
import { ALL_POKEMON_REDIS_CACHE_KEY, POKEMON_FETCH_FAIL, POKEMON_NOT_FOUND, REDIS_TTL } from 'src/constants';

@Injectable()
export class PokemonService {
  constructor(
    @InjectRepository(Pokemon)
    private readonly pokemonRepository: Repository<Pokemon>,
    private readonly redisService: RedisService,
  ) {}

  async getAllPokemon(): Promise<Pokemon[]> {
  
    const cachedPokemon = await this.redisService.getCache(ALL_POKEMON_REDIS_CACHE_KEY);

    if (cachedPokemon && cachedPokemon.length) {
      return JSON.parse(cachedPokemon);
    }
  
    const allPokemon = await this.pokemonRepository.find();


    if (!allPokemon || !allPokemon.length) {
      throw new Error(POKEMON_NOT_FOUND);
    }
  
    await this.redisService.setCache(ALL_POKEMON_REDIS_CACHE_KEY, JSON.stringify(allPokemon), REDIS_TTL);
  
    return allPokemon;
  }
  

  async getPokemonById(pokemonId: number): Promise<Pokemon> {
    const cacheKey = `pokemon:${pokemonId}`;

    const cachedPokemon = await this.redisService.getCache(cacheKey);
    if (cachedPokemon) {
      return JSON.parse(cachedPokemon);
    }

    let pokemon = await this.pokemonRepository.findOne({ where: { id: pokemonId } });
    if (!pokemon) {
        let pokemonData, speciesData, characteristicsResult;
        try {
            [pokemonData, speciesData, characteristicsResult] = await Promise.allSettled([
                fetchPokemonData(pokemonId),
                fetchSpeciesData(pokemonId),
                fetchCharacteristics(pokemonId),
              ]);
        } catch(err) {
            throw new Error(`${POKEMON_NOT_FOUND}: ${pokemonId}`);
        }


      if (pokemonData.status === 'fulfilled' && speciesData.status === 'fulfilled') {

        const { name, types, eggGroups, characteristics } = getPokemonFields(pokemonData.value, speciesData.value, characteristicsResult)

          pokemon = this.pokemonRepository.create({
            id: pokemonId,
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

    handleAllRedisSettingsForPokemon(pokemon, cacheKey, this.redisService);

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
    handleAllRedisSettingsForPokemon(pokemon, cacheKey, this.redisService, true);

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

    const allPokemonCache = await this.redisService.getCache(ALL_POKEMON_REDIS_CACHE_KEY);
    let allPokemon: Pokemon[] = [];
    
    if (allPokemonCache) {
        allPokemon = JSON.parse(allPokemonCache);
    }

    allPokemon = allPokemon.filter(pokemon=>pokemon.id !== pokemonId)
    this.redisService.setCache(ALL_POKEMON_REDIS_CACHE_KEY, JSON.stringify(allPokemon), REDIS_TTL);

    await this.pokemonRepository.remove(pokemon);

    return true;
  }

}
