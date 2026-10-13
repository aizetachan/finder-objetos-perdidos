import type { DateFilterPeriod } from '@finder/shared'

export const ALL_OPTION = 'all'

export interface DatePeriodOption {
  value: DateFilterPeriod | typeof ALL_OPTION
  label: string
}

export const DATE_PERIOD_OPTIONS: readonly DatePeriodOption[] = [
  { value: 'all', label: 'Cualquier fecha' },
  { value: '24h', label: 'Últimas 24 horas' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
] as const
