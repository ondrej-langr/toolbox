import type { TextProps } from '@radix-ui/themes';

export const contexts = ['aco', 'larokinvest', 'spcom'] as const;
export const contextToColors: Record<
  (typeof contexts)[number],
  TextProps['color']
> = {
  aco: 'blue',
  larokinvest: 'green',
  spcom: 'yellow',
};
