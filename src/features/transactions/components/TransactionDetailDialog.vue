<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import dayjs from 'dayjs'

const props = defineProps<{
  open: boolean
  transactionId?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const store = useTransactionStore()
const settingsStore = useSettingsStore()

const tx = computed(() => {
  if (!props.transactionId) return null
  return store.transactions.find(t => t.id === props.transactionId)
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <div class="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogDescription>
          Detailed view of this transaction.
        </DialogDescription>
      </div>
      
      <div v-if="tx" class="space-y-4 text-sm">
        <div class="grid grid-cols-3 gap-2 py-1 border-b">
          <span class="text-muted-foreground font-medium">Category</span>
          <span class="col-span-2">{{ tx.categoryName || 'Unknown Category' }}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1 border-b">
          <span class="text-muted-foreground font-medium">Source</span>
          <span class="col-span-2">{{ tx.sourceName || 'Unknown Source' }}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1 border-b">
          <span class="text-muted-foreground font-medium">Type</span>
          <span class="col-span-2 font-medium" :class="tx.type === 'Income' ? 'text-green-600' : 'text-red-600'">
            {{ tx.type }}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1 border-b">
          <span class="text-muted-foreground font-medium">Amount</span>
          <span class="col-span-2 font-mono">{{ settingsStore.formatCurrency(tx.amount) }}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1 border-b">
          <span class="text-muted-foreground font-medium">Status</span>
          <span class="col-span-2">
            <span 
              class="px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider"
              :class="{
                'bg-green-100 text-green-700': tx.status === 'Completed',
                'bg-amber-100 text-amber-700': tx.status === 'Pending',
                'bg-slate-100 text-slate-700': tx.status === 'Cancelled'
              }"
            >
              {{ tx.status || 'Completed' }}
            </span>
          </span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1 border-b">
          <span class="text-muted-foreground font-medium">Trans. Date</span>
          <span class="col-span-2">{{ dayjs(tx.transactionDate).format('YYYY-MM-DD HH:mm') }}</span>
        </div>
        <div v-if="tx.status === 'Completed'" class="grid grid-cols-3 gap-2 py-1 border-b">
          <span class="text-muted-foreground font-medium">Completed</span>
          <span class="col-span-2">{{ tx.completedDate ? dayjs(tx.completedDate).format('YYYY-MM-DD HH:mm') : '-' }}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1 border-b">
          <span class="text-muted-foreground font-medium">Note</span>
          <span class="col-span-2">{{ tx.note || '-' }}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1 border-b">
          <span class="text-muted-foreground font-medium text-xs">Created At</span>
          <span class="col-span-2 text-xs">{{ dayjs(tx.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 py-1">
          <span class="text-muted-foreground font-medium text-xs">Updated At</span>
          <span class="col-span-2 text-xs">{{ dayjs(tx.updatedAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
      </div>
      <div v-else class="py-4 text-center text-muted-foreground">
        Transaction not found.
      </div>
    </DialogContent>
  </Dialog>
</template>
