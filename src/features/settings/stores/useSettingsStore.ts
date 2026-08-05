import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsApi } from '../ipc'
import type { AppSettings } from '../types'
import { toast } from 'vue-sonner'
import dayjs from 'dayjs'

export const useSettingsStore = defineStore('settings', () => {
  const preferences = ref<AppSettings>({
    theme: 'system',
    currency: 'VND',
    date_format: 'dd/MM/yyyy',
    first_day_of_week: 'Monday'
  })

  const isLoading = ref(false)

  // System theme matcher
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const applyTheme = (theme: AppSettings['theme']) => {
    const root = document.documentElement
    if (theme === 'dark' || (theme === 'system' && mediaQuery.matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  // Watch for system theme changes if set to system
  mediaQuery.addEventListener('change', () => {
    if (preferences.value.theme === 'system') {
      applyTheme('system')
    }
  })

  const loadSettings = async () => {
    try {
      isLoading.value = true
      const data = await settingsApi.getAll()
      
      preferences.value = {
        theme: (data.theme as AppSettings['theme']) || 'system',
        currency: (data.currency as AppSettings['currency']) || 'VND',
        date_format: (data.date_format as AppSettings['date_format']) || 'dd/MM/yyyy',
        first_day_of_week: (data.first_day_of_week as AppSettings['first_day_of_week']) || 'Monday'
      }

      applyTheme(preferences.value.theme)
    } catch (e) {
      console.error('Failed to load settings', e)
    } finally {
      isLoading.value = false
    }
  }

  const saveSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    try {
      await settingsApi.set(key, value)
      preferences.value[key] = value
      
      if (key === 'theme') {
        applyTheme(value as AppSettings['theme'])
      }
      
      toast.success('Setting saved')
    } catch (e) {
      console.error('Failed to save setting', e)
      toast.error('Failed to save setting')
    }
  }

  const seedDemoData = async () => {
    try {
      isLoading.value = true
      await settingsApi.seedDemoData()
      toast.success('Demo data seeded successfully')
    } catch (e) {
      console.error('Failed to seed demo data', e)
      toast.error('Failed to seed demo data')
    } finally {
      isLoading.value = false
    }
  }

  const resetData = async () => {
    try {
      isLoading.value = true
      await settingsApi.resetApplicationData()
      toast.success('All data has been reset')
    } catch (e) {
      console.error('Failed to reset data', e)
      toast.error('Failed to reset data')
    } finally {
      isLoading.value = false
    }
  }

  // Formatters
  const formatCurrency = (amount: number) => {
    let locale = 'vi-VN'
    
    if (preferences.value.currency === 'USD') locale = 'en-US'
    if (preferences.value.currency === 'EUR') locale = 'de-DE' // or en-IE, fr-FR depending on visual preference

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: preferences.value.currency,
      maximumFractionDigits: preferences.value.currency === 'VND' ? 0 : 2
    }).format(amount)
  }

  const formatDate = (date: string | Date | number, format?: string) => {
    const defaultFormat = format || preferences.value.date_format
    
    let dayjsFormat = 'DD/MM/YYYY'
    if (defaultFormat === 'dd/MM/yyyy') dayjsFormat = 'DD/MM/YYYY'
    if (defaultFormat === 'MM/dd/yyyy') dayjsFormat = 'MM/DD/YYYY'
    if (defaultFormat === 'yyyy-MM-dd') dayjsFormat = 'YYYY-MM-DD'
    
    return dayjs(date).format(dayjsFormat)
  }

  const formatDateTime = (date: string | Date | number) => {
    return formatDate(date) + ' ' + dayjs(date).format('HH:mm')
  }

  return {
    preferences,
    isLoading,
    loadSettings,
    saveSetting,
    seedDemoData,
    resetData,
    formatCurrency,
    formatDate,
    formatDateTime
  }
})
