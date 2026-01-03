export type Girl = {
  code: string;
  name: string;
};

export type Waiter = {
  code: string;
  name: string;
};

export const girls: Girl[] = [
  { code: "G01", name: "Girl 01" },
  { code: "G02", name: "Girl 02" },
  { code: "G03", name: "Girl 03" },
];

export const waiters: Waiter[] = [
  { code: "W01", name: "W01" },
  { code: "W02", name: "W02" },
  { code: "W03", name: "W03" },
];

export function getGirlName(code: string) {
  return girls.find((g) => g.code === code)?.name ?? code;
}

export function getWaiterName(code: string) {
  return waiters.find((w) => w.code === code)?.name ?? code;
}
