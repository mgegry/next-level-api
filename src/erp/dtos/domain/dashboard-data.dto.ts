export interface DashboardDataDto {
  amountAccountsReceivableInvoices: { currency: string; amount: number }[];
  amountAccountReceivableAdvancePayments: {
    currency: string;
    amount: number;
  }[];

  amountAccountsPayableInvoices: { currency: string; amount: number }[];
  amountAccountPayableAdvancePayments: {
    currency: string;
    amount: number;
  }[];
}
