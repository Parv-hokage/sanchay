import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { ProfileResolverService } from './profile-resolver.service';

@Module({
  controllers: [MeController],
  providers: [MeService, ProfileResolverService],
  exports: [MeService, ProfileResolverService],
})
export class MeModule {}
