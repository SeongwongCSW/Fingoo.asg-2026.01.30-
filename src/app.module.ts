import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    // 1. ConfigModule 설정 (전역 사용)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. DB 연결 설정 (환경변수 사용)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true, //실무에선 사용 안하고 개발중일 때만 사용할 예정
      }),
    }),
    FinanceModule,
  ],
})
export class AppModule {}
