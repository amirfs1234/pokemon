import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { Pokemon } from './entities/pokemon.entity';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pokemon]),
    HttpModule,
  ],
  providers: [PokemonService, RedisService],
  controllers: [PokemonController],
  exports: [TypeOrmModule],
})
export class PokemonModule {}
