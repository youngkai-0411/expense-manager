<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { transactionApi } from '@/features/transactions/ipc'
import type { SourceReportItem, DashboardFilter } from '../types'
import type { Transaction } from '@/features/transactions/types'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

const props = defineProps<{
  open: boolean
  source: SourceReportItem | null
  filters: DashboardFilter
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const settingsStore = useSettingsStore()
const transactions = ref<Transaction[]>([])
const isLoading = ref(false)

watch(() => props.open, async (isOpen) => {
  if (isOpen && props.source) {
    isLoading.value = true
    const allTx = await transactionApi.getAll()
    
    let filtered = allTx.filter(t => {
      const tSource = t.sourceId || -1
      return tSource === props.source!.sourceId
    })
    
    if (props.filters.startDate && props.filters.endDate) {
      filtered = filtered.filter(t => dayjs(t.transactionDate).isBetween(props.filters.startDate, dayjs(props.filters.endDate).endOf('day'), null, '[]'))
    }
    if (props.filters.categoryId !== 'All') {
      filtered = filtered.filter(t => t.categoryId === props.filters.categoryId)
    }
    if (props.filters.type !== 'All') {
      filtered = filtered.filter(t => t.type === props.filters.type)
    }
    if (props.filters.status !== 'All') {
      filtered = filtered.filter(t => t.status === props.filters.status)
    }
    
    transactions.value = filtered
    isLoading.value = false
  } else {
    transactions.value = []
  }
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
      <div v-if="source" class="space-y-6">
        <div>
          <DialogTitle class="text-2xl">{{ source.name }}</DialogTitle>
          <DialogDescription>Source Details</DialogDescription>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl border bg-card flex flex-col items-center">
            <span class="text-sm text-muted-foreground">Income</span>
            <span class="text-lg font-bold text-green-600">{{ settingsStore.formatCurrency(source.income) }}</span>
          </div>
          <div class="p-4 rounded-xl border bg-card flex flex-col items-center">
            <span class="text-sm text-muted-foreground">Expense</span>
            <span class="text-lg font-bold text-red-600">{{ settingsStore.formatCurrency(source.expense) }}</span>
          </div>
          <div class="p-4 rounded-xl border bg-card flex flex-col items-center">
            <span class="text-sm text-muted-foreground">Balance</span>
            <span class="text-lg font-bold" :class="source.balance >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ settingsStore.formatCurrency(source.balance) }}
            </span>
          </div>
          <div class="p-4 rounded-xl border bg-card flex flex-col items-center">
            <span class="text-sm text-muted-foreground">Transactions</span>
            <span class="text-lg font-bold">{{ source.transactionCount }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <h3 class="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Transaction History</h3>
          <div v-if="isLoading" class="p-4 text-center text-muted-foreground">Loading...</div>
          <div v-else-if="transactions.length === 0" class="p-4 text-center border rounded-lg text-muted-foreground bg-card/50">
            No transactions found.
          </div>
          <div v-else class="space-y-2">
            <div v-for="tx in transactions" :key="tx.id" class="flex justify-between items-center p-3 border rounded-lg bg-card text-sm">
              <div class="flex flex-col">
                <span class="font-medium">{{ tx.categoryName || 'Unknown Category' }}</span>
                <span class="text-xs text-muted-foreground">
                  {{ dayjs(tx.transactionDate).format('YYYY-MM-DD HH:mm') }} 
                  <template v-if="tx.note">• {{ tx.note }}</template>
                </span>
              </div>
              <div class="flex flex-col items-end">
                <span 
                  class="font-mono font-medium"
                  :class="tx.type === 'Income' ? 'text-green-600' : 'text-red-600'"
                >
                  {{ tx.type === 'Income' ? '+' : '-' }}{{ settingsStore.formatCurrency(tx.amount) }}
                </span>
                <span class="text-[10px] uppercase font-bold text-muted-foreground">{{ tx.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
