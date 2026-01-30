import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Finance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyName: string; // 기업명

  @Column()
  crno: string; // 법인등록번호

  @Column()
  bizYear: string; // 사업연도

  // 금액은 단위가 크므로 String으로 저장 (계산 필요시 BigInt 변환)
  @Column({ type: 'bigint', nullable: true })
  salesAmount: string; // 매출액

  @Column({ type: 'bigint', nullable: true })
  operatingProfit: string; // 영업이익

  @Column({ type: 'bigint', nullable: true })
  netIncome: string; // 당기순이익

  @CreateDateColumn()
  createdAt: Date;
}
