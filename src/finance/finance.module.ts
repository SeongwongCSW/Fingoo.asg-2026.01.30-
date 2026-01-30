import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Finance } from './entities/finance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Finance]), // Repository 사용
    HttpModule, // HttpService 사용
    ConfigModule,
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
