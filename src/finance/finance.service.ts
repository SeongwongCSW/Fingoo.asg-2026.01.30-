import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Finance } from './entities/finance.entity';
import { CreateFinanceDto } from './dto/create-finance.dto';

// 공공데이터
interface PublicDataWrapper<T> {
  response: {
    body: {
      items: {
        item: T | T[];
      };
    };
  };
}

// 기업개요
interface CorpOutlineResponse {
  crno: string;
  corpNm: string;
}

// 재무제표
interface FinanceApiResponse {
  bizYear: string;
  enpSaleAmt: string;
  enpBzopPft: string;
  enpCrtmNpf: string;
}

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Finance)
    private readonly financeRepo: Repository<Finance>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async syncFinanceData(dto: CreateFinanceDto): Promise<Finance> {
    const { companyName, targetYear } = dto;
    const crno = await this.getCrnoByName(companyName);
    const financeData = await this.getFinanceByCrno(crno, targetYear);

    if (!financeData) {
      throw new NotFoundException(
        `${companyName}의 ${targetYear}년 재무제표 데이터가 존재하지 않습니다.`,
      );
    }

    const newFinance = this.financeRepo.create({
      companyName,
      crno,
      bizYear: financeData.bizYear,
      salesAmount: financeData.enpSaleAmt,
      operatingProfit: financeData.enpBzopPft,
      netIncome: financeData.enpCrtmNpf,
    });

    return await this.financeRepo.save(newFinance);
  }

  // [Private] 기업개요조회 API
  private async getCrnoByName(companyName: string): Promise<string> {
    const apiKey = this.configService.get<string>('OPEN_API_KEY_1');
    const url =
      'http://apis.data.go.kr/1160100/service/GetCorpBasicInfoService_V2/getCorpOutline_V2';

    try {
      const response = await firstValueFrom(
        this.httpService.get<PublicDataWrapper<CorpOutlineResponse>>(url, {
          params: {
            serviceKey: apiKey,
            pageNo: '1',
            numOfRows: '1',
            resultType: 'json',
            corpNm: companyName,
          },
        }),
      );

      const items = response.data.response.body.items.item;
      const item = Array.isArray(items) ? items[0] : items;

      if (!item) throw new Error();
      return item.crno;
    } catch (e) {
      console.error(e);
      throw new NotFoundException(
        `${companyName} 기업 정보를 찾을 수 없습니다.`,
      );
    }
  }

  // [Private] 재무제표조회 API
  private async getFinanceByCrno(
    crno: string,
    targetYear: string,
  ): Promise<FinanceApiResponse | null> {
    const apiKey = this.configService.get<string>('OPEN_API_KEY_2');
    const url =
      'http://apis.data.go.kr/1160100/service/GetFinaStatInfoService_V2/getSummFinaStat_V2';

    try {
      const response = await firstValueFrom(
        this.httpService.get<PublicDataWrapper<FinanceApiResponse>>(url, {
          params: {
            serviceKey: apiKey,
            numOfRows: '10',
            pageNo: '1',
            resultType: 'json',
            crno: crno,
            bizYear: targetYear,
          },
        }),
      );

      const items = response.data?.response?.body?.items?.item;
      if (!items) return null;

      const financeList = Array.isArray(items) ? items : [items];

      // 매출액(enpSaleAmt) != 0
      const validData = financeList.find(
        (data) => data.enpSaleAmt && data.enpSaleAmt !== '0',
      );

      if (validData) {
        return validData;
      } else {
        return financeList[0];
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
