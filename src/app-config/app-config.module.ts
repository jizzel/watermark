import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import queueConfig from './configs/queue.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [queueConfig],
    }),
  ],
})
export class AppConfigModule {}
