import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFinanceDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsString()
  targetYear: string;
}
