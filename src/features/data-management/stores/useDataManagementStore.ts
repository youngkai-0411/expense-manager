import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dataApi } from '../ipc'
import { toast } from 'vue-sonner'

export const useDataManagementStore = defineStore('dataManagement', () => {
  const isLoading = ref(false)

  const wrapApiCall = async (
    apiCall: () => Promise<boolean>, 
    successMessage: string, 
    errorMessage: string
  ) => {
    try {
      isLoading.value = true
      const result = await apiCall()
      if (result) {
        toast.success(successMessage)
      }
      return result
    } catch (e) {
      console.error(errorMessage, e)
      toast.error(errorMessage)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const exportTransactionsCsv = async () => {
    await wrapApiCall(
      dataApi.exportTransactionsCsv,
      'Transactions exported to CSV successfully',
      'Failed to export transactions to CSV'
    )
  }

  const exportTransactionsExcel = async () => {
    await wrapApiCall(
      dataApi.exportTransactionsExcel,
      'Transactions exported to Excel successfully',
      'Failed to export transactions to Excel'
    )
  }

  const exportCategoriesCsv = async () => {
    await wrapApiCall(
      dataApi.exportCategoriesCsv,
      'Categories exported to CSV successfully',
      'Failed to export categories to CSV'
    )
  }

  const createBackup = async () => {
    await wrapApiCall(
      dataApi.createBackup,
      'Backup created successfully',
      'Failed to create backup'
    )
  }

  const restoreBackup = async () => {
    const success = await wrapApiCall(
      dataApi.restoreBackup,
      'Backup restored successfully',
      'Failed to restore backup'
    )
    if (success) {
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  return {
    isLoading,
    exportTransactionsCsv,
    exportTransactionsExcel,
    exportCategoriesCsv,
    createBackup,
    restoreBackup
  }
})
