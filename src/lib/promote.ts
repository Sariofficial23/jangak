// Платные услуги продвижения. Цены дублируют серверную логику в RPC create_service_order.

// ЗАМЕНИ на свой номер для приёма оплаты (MBank / Элсом / O!Деньги)
export const PAYMENT_PHONE = "+996 700 000 000";
export const PAYMENT_WALLETS = "MBank · Элсом · O!Деньги";

export type ServiceKey = "bump" | "vip7" | "vip30";

export type ServiceOption = {
  key: ServiceKey;
  service: "vip" | "bump";
  days: number | null;
  price: number;
};

export const SERVICE_OPTIONS: ServiceOption[] = [
  { key: "bump", service: "bump", days: null, price: 30 },
  { key: "vip7", service: "vip", days: 7, price: 100 },
  { key: "vip30", service: "vip", days: 30, price: 300 },
];
