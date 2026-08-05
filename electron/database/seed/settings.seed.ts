import type { NewSetting } from '../schema'

/** Cấu hình mặc định của ứng dụng. */
export const settingSeeds: NewSetting[] = [
  { key: 'theme', value: 'system' },
  { key: 'currency', value: 'VND' },
]
