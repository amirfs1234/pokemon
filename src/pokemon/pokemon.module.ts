import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { Pokemon } from './entities/pokemon.entity';
import { RedisService } from '../redis/redis.service'; // Use your custom RedisService

@Module({
  imports: [
    TypeOrmModule.forFeature([Pokemon]), // Register Pokemon repository
    HttpModule,
  ],
  providers: [PokemonService, RedisService], // Provide your custom RedisService here
  controllers: [PokemonController],
  exports: [TypeOrmModule], // Export TypeOrmModule if needed by other modules
})
export class PokemonModule {}
