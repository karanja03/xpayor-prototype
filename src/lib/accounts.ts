export type Account = {
  id: string;
  name: string;
  category: string;
  masked: string;
  balance: number;
};

export const accounts: Account[] = [
  { id: "product-testing-b", name: "Product Testing B", category: "Account Payables", masked: "****9457", balance: 300 },
  { id: "prod-tests-beta", name: "Prod Tests Beta", category: "Account Payables", masked: "****7097", balance: 225 },
  { id: "prod-tests-alpha", name: "Prod Tests Alpha", category: "Account Payables", masked: "****7105", balance: 399.8 },
];

export function sourceAccountLabel(a: Account): string {
  return `${a.name} - KES ${a.balance.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
