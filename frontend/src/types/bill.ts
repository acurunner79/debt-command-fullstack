export type BillType =
  | "CREDIT_CARD"
  | "AUTO_LOAN"
  | "PERSONAL_LOAN"
  | "MORTGAGE"
  | "RENT"
  | "UTILITY"
  | "INSURANCE"
  | "SUBSCRIPTION"
  | "MEDICAL"
  | "STUDENT_LOAN"
  | "OTHER";

export type Bill = {
  id: string;
  userId: string;
  name: string;
  type: BillType;
  dueDay: number;
  balance: string | null;
  minimumPayment: string;
  creditLimit: string | null;
  interestRate: string | null;
  autopay: boolean;
  recurring: boolean;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BillsResponse = {
  bills: Bill[];
};

export type BillResponse = {
  bill: Bill;
};

export type CreateBillInput = {
  name: string;
  type: BillType;
  dueDay: number;
  balance?: number | null;
  minimumPayment: number;
  creditLimit?: number | null;
  interestRate?: number | null;
  autopay: boolean;
  recurring: boolean;
  notes?: string;
};

export type UpdateBillInput = Partial<CreateBillInput> & {
  active?: boolean;
};