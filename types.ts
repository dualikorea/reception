
export enum Category {
  REPAIR = '수리접수',
  DEVELOPMENT = '개발요청'
}

export enum Status {
  PENDING = '미정',
  IN_PROGRESS = '진행중',
  COMPLETED = '완료'
}

export enum ProcessType {
  REPAIR = '수리',
  REPLACEMENT = '교체',
  IMPOSSIBLE = '수리불가',
  OTHER = '기타'
}

export interface RequestItem {
  id: string;
  category: Category;
  customer: string;
  receiveDate: string;
  product: string;
  qty: number;
  issue: string;
  buyDate: string;
  processType?: ProcessType;
  processNote?: string;
  status: Status;
  processDate?: string;
}

export interface ChartData {
  name: string;
  value: number;
}
