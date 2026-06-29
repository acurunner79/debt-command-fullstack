export type IncomeFrequency =
  | "WEEKLY"
  | "BIWEEKLY"
  | "SEMIMONTHLY"
  | "MONTHLY"
  | "YEARLY"
  | "ONETIME";

export type IncomeSource = {
  id: string;
  userId: string;
  name: string;
  amount: string;
  frequency: IncomeFrequency;
  active: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IncomeSourcesResponse = {
  incomeSources: IncomeSource[];
};

export type IncomeSourceResponse = {
  incomeSource: IncomeSource;
};

export type CreateIncomeSourceInput = {
  name: string;
  amount: number;
  frequency: IncomeFrequency;
  notes?: string;
};

export type UpdateIncomeSourceInput = Partial<CreateIncomeSourceInput> & {
  active?: boolean;
};