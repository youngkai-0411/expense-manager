<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { transactionApi } from '@/features/transactions/ipc'
import type { CategoryReportItem, DashboardFilter } from '../types'
import type { Transaction } from '@/features/transactions/types'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import * as Icons from '@lucide/vue'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

const getIconComponent = (iconName: string | null | undefined) => {
  return iconName && (Icons as Record<string, any>)[iconName] ? (Icons as Record<string, any>)[iconName] : Icons.Tag
}

const props = defineProps<{
  open: boolean
  category: CategoryReportItem | null
  filters: DashboardFilter
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const settingsStore = useSettingsStore()
const transactions = ref<Transaction[]>([])
const isLoading = ref(false)

watch(() => props.open, async (isOpen) => {
  if (isOpen && props.category) {
    isLoading.value = true
    const allTx = await transactionApi.getAll()
    
    let filtered = allTx.filter(t => t.categoryId === props.category!.categoryId)
    
    if (props.filters.startDate && props.filters.endDate) {
      filtered = filtered.filter(t => dayjs(t.transactionDate).isBetween(props.filters.startDate, dayjs(props.filters.endDate).endOf('day'), null, '[]'))
    }
    if (props.filters.sourceId !== 'All') {
      filtered = filtered.filter(t => t.sourceId === props.filters.sourceId)
    }
    if (props.filters.type !== 'All') {
      filtered = filtered.filter(t => t.type === props.filters.type)
    }
    if (props.filters.status !== 'All') {
      filtered = filtered.filter(t => t.status === props.filters.status)
    } else {
      // Default dashboard behavior mostly cares about completed transactions for standard reports, but we respect the filter if any
    }
    
    transactions.value = filtered
    isLoading.value = false
  } else {
    transactions.value = []
  }
})

const topSources = computed(() => {
  const map = new Map<number, { name: string, amount: number }>()
  transactions.value.forEach(tx => {
    const sId = tx.sourceId || -1
    const name = tx.sourceName || 'Unknown'
    if (!map.has(sId)) {
      map.set(sId, { name, amount: 0 })
    }
    map.get(sId)!.amount += tx.amount
  })
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount).slice(0, 5)
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
      <div v-if="category" class="space-y-6">
        <div class="flex items-center gap-4">
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            :style="{ backgroundColor: `${category.color}20`, color: category.color }"
          >
            <component :is="getIconComponent(category.icon)" class="w-6 h-6" />
          </div>
          <div>
            <DialogTitle class="text-2xl">{{ category.name }}</DialogTitle>
            <DialogDescription>Category Details</DialogDescription>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 rounded-xl border bg-card flex flex-col items-center">
            <span class="text-sm text-muted-foreground">Income</span>
            <span class="text-lg font-bold text-green-600">{{ settingsStore.formatCurrency(category.income) }}</span>
          </div>
          <div class="p-4 rounded-xl border bg-card flex flex-col items-center">
            <span class="text-sm text-muted-foreground">Expense</span>
            <span class="text-lg font-bold text-red-600">{{ settingsStore.formatCurrency(category.expense) }}</span>
          </div>
          <div class="p-4 rounded-xl border bg-card flex flex-col items-center">
            <span class="text-sm text-muted-foreground">Balance</span>
            <span class="text-lg font-bold" :class="category.balance >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ settingsStore.formatCurrency(category.balance) }}
            </span>
          </div>
        </div>

        <div v-if="topSources.length > 0" class="space-y-2">
          <h3 class="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Top Sources</h3>
          <div class="space-y-2">
            <div v-for="source in topSources" :key="source.name" class="flex justify-between items-center p-3 border rounded-lg bg-card/50">
              <span class="font-medium">{{ source.name }}</span>
              <span class="font-mono text-sm">{{ settingsStore.formatCurrency(source.amount) }}</span>
            </div>
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
                <span class="font-medium">{{ tx.sourceName || 'Unknown Source' }}</span>
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
