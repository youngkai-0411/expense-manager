import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { transactionApi } from '../ipc'
import type { Transaction, CreateTransactionPayload, UpdateTransactionPayload } from '../types'
import { toast } from 'vue-sonner'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  // Filters
  const searchQuery = ref('')
  const typeFilter = ref<string>('All') // 'All', 'Income', 'Expense'
  const categoryFilter = ref<number | 'All'>('All')
  const sourceFilter = ref<number | 'All'>('All')
  const statusFilter = ref<'All' | 'Pending' | 'Completed' | 'Cancelled'>('All')
  const dateRange = ref<{ start?: string, end?: string }>({})
  const sortBy = ref<'transactionDate' | 'amount' | 'category' | 'source' | 'createdAt'>('transactionDate')
  const sortDirection = ref<'desc' | 'asc'>('desc')

  // Computed
  const filteredTransactions = computed(() => {
    let result = transactions.value

    if (searchQuery.value) {
      const lowerQuery = searchQuery.value.toLowerCase()
      result = result.filter(t => 
        t.note?.toLowerCase().includes(lowerQuery) ||
        t.categoryName?.toLowerCase().includes(lowerQuery) ||
        t.sourceName?.toLowerCase().includes(lowerQuery)
      )
    }

    if (typeFilter.value !== 'All') {
      result = result.filter(tx => tx.type === typeFilter.value)
    }

    if (categoryFilter.value !== 'All') {
      result = result.filter(t => t.categoryId === categoryFilter.value)
    }

    if (sourceFilter.value !== 'All') {
      result = result.filter(t => t.sourceId === sourceFilter.value)
    }

    if (statusFilter.value !== 'All') {
      result = result.filter(t => t.status === statusFilter.value)
    }

    if (dateRange.value.start && dateRange.value.end) {
      const start = dayjs(dateRange.value.start)
      const end = dayjs(dateRange.value.end).endOf('day')
      result = result.filter(t => {
        const txDate = dayjs(t.transactionDate)
        return txDate.isBetween(start, end, null, '[]')
      })
    }

    result.sort((a, b) => {
      let comparison = 0
      if (sortBy.value === 'transactionDate') {
        comparison = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
      } else if (sortBy.value === 'amount') {
        comparison = a.amount - b.amount
      } else if (sortBy.value === 'category') {
        comparison = (a.categoryName || '').localeCompare(b.categoryName || '')
      } else if (sortBy.value === 'source') {
        comparison = (a.sourceName || '').localeCompare(b.sourceName || '')
      } else if (sortBy.value === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return sortDirection.value === 'desc' ? -comparison : comparison
    })

    return result
  })

  // Grouped for Timeline view
  const groupedTransactions = computed(() => {
    const groups: Record<string, Transaction[]> = {}
    filteredTransactions.value.forEach(t => {
      // Extract just the YYYY-MM-DD part if it's ISO, or use as is
      const dateKey = t.transactionDate.split('T')[0]
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(t)
    })
    
    // Sort groups descending
    return Object.keys(groups)
      .sort((a, b) => sortDirection.value === 'desc' 
        ? new Date(b).getTime() - new Date(a).getTime() 
        : new Date(a).getTime() - new Date(b).getTime()
      )
      .map(date => ({
        date,
        transactions: groups[date]
      }))
  })

  // Actions
  const loadTransactions = async () => {
    isLoading.value = true
    error.value = null
    try {
      transactions.value = await transactionApi.getAll()
    } catch (e: any) {
      error.value = e.message || 'Failed to load transactions'
      toast.error(error.value as string)
    } finally {
      isLoading.value = false
    }
  }

  const createTransaction = async (payload: CreateTransactionPayload) => {
    try {
      await transactionApi.create(payload)
      await loadTransactions()
      toast.success('Transaction created successfully')
    } catch (e: any) {
      const msg = e.message || 'Failed to create transaction'
      toast.error(msg)
      throw new Error(msg)
    }
  }

  const updateTransaction = async (payload: UpdateTransactionPayload) => {
    try {
      const { id, ...data } = payload
      await transactionApi.update(id, data)
      await loadTransactions()
      toast.success('Transaction updated successfully')
    } catch (e: any) {
      const msg = e.message || 'Failed to update transaction'
      toast.error(msg)
      throw new Error(msg)
    }
  }

  const updateStatus = async (id: number, status: 'Pending' | 'Completed' | 'Cancelled') => {
    try {
      await transactionApi.updateStatus(id, status)
      await loadTransactions()
    } catch (e: any) {
      const msg = e.message || 'Failed to update status'
      toast.error(msg)
      throw new Error(msg)
    }
  }

  const deleteTransaction = async (id: number) => {
    try {
      await transactionApi.delete(id)
      transactions.value = transactions.value.filter(t => t.id !== id)
      toast.success('Transaction deleted')
    } catch (e: any) {
      const msg = e.message || 'Failed to delete transaction'
      toast.error(msg)
      throw new Error(msg)
    }
  }

  return {
    transactions,
    isLoading,
    error,
    searchQuery,
    typeFilter,
    categoryFilter,
    sourceFilter,
    statusFilter,
    dateRange,
    sortBy,
    sortDirection,
    filteredTransactions,
    groupedTransactions,
    loadTransactions,
    createTransaction,
    updateTransaction,
    updateStatus,
    deleteTransaction
  }
})
