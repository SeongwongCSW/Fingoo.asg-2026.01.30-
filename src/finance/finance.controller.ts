import { Body, Controller, Post } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFinanceDto } from './dto/create-finance.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  async getFinance(@Body() dto: CreateFinanceDto) {
    return this.financeService.syncFinanceData(dto);
  }
}
