<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useCategoryStore } from '@/features/categories/stores/useCategoryStore'
import { useSourceStore } from '@/features/sources/stores/useSourceStore'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import TransactionDialog from '../components/TransactionDialog.vue'
import TransactionDetailDialog from '../components/TransactionDetailDialog.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import * as Icons from '@lucide/vue'
import dayjs from 'dayjs'
import { toast } from 'vue-sonner'

const store = useTransactionStore()
const categoryStore = useCategoryStore()
const sourceStore = useSourceStore()
const settingsStore = useSettingsStore()

const dialogOpen = ref(false)
const detailDialogOpen = ref(false)
const selectedTransactionId = ref<number | null>(null)

const openCreateDialog = () => {
  selectedTransactionId.value = null
  dialogOpen.value = true
}

const openEditDialog = (id: number) => {
  selectedTransactionId.value = id
  dialogOpen.value = true
}

const openDetailDialog = (id: number) => {
  selectedTransactionId.value = id
  detailDialogOpen.value = true
}

const confirmArchive = async (id: number) => {
  if (confirm('Are you sure you want to delete this transaction?')) {
    await store.archiveTransaction(id)
  }
}

const markAsCompleted = async (id: number) => {
  try {
    await store.updateStatus(id, 'Completed')
    toast.success('Transaction marked as completed.')
  } catch (e) {
    // error is handled by store
  }
}

// Helpers for UI
const getCategory = (id: number) => categoryStore.categories.find(c => c.id === id)

const getIconComponent = (iconName?: string | null) => {
  if (!iconName) return Icons.CircleDollarSign
  return (Icons as Record<string, any>)[iconName] || Icons.CircleDollarSign
}

onMounted(async () => {
  await Promise.all([
    categoryStore.loadCategories(),
    sourceStore.loadSources(),
    store.loadTransactions()
  ])
})
</script>

<template>
  <div class="p-8 max-w-5xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold tracking-tight">Transactions</h1>
      <Button @click="openCreateDialog">
        <Icons.Plus class="w-4 h-4 mr-2" />
        New Transaction
      </Button>
    </div>

    <!-- Toolbar Filters -->
    <div class="flex flex-wrap items-center gap-3 bg-card p-3 rounded-lg border shadow-sm">
      <div class="relative flex-1 min-w-[200px]">
        <Icons.Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          v-model="store.searchQuery" 
          placeholder="Search notes..." 
          class="pl-9 h-9"
        />
      </div>
      
      <select 
        v-model="store.typeFilter"
        class="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="All">All Types</option>
        <option value="Income">Income</option>
        <option value="Expense">Expense</option>
      </select>

      <select 
        v-model="store.statusFilter"
        class="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="All">All Status</option>
        <option value="Completed">Completed</option>
        <option value="Pending">Pending</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      <select 
        v-model="store.categoryFilter"
        class="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="All">All Categories</option>
        <option v-for="c in categoryStore.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>

      <select 
        v-model="store.sourceFilter"
        class="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="All">All Sources</option>
        <option v-for="s in sourceStore.sources" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      
      <div class="ml-auto flex items-center gap-2">
        <select 
          v-model="store.sortBy"
          class="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="transactionDate">Date</option>
          <option value="amount">Amount</option>
          <option value="category">Category</option>
          <option value="source">Source</option>
          <option value="createdAt">Created</option>
        </select>
        <Button variant="ghost" size="icon" @click="store.sortDirection = store.sortDirection === 'desc' ? 'asc' : 'desc'" class="h-9 w-9 border" title="Toggle Sort Direction">
          <Icons.ArrowUpDown class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Timeline Content -->
    <div class="space-y-8">
      <div v-if="store.isLoading" class="p-12 text-center text-muted-foreground border rounded-lg bg-card">
        Loading transactions...
      </div>
      
      <div v-else-if="store.groupedTransactions.length === 0" class="p-16 text-center border rounded-lg bg-card shadow-sm">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icons.ReceiptText class="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-medium">No transactions found</h3>
        <p class="text-sm text-muted-foreground mt-1 mb-4">
          Try adjusting your filters or create a new transaction.
        </p>
        <Button variant="outline" @click="openCreateDialog">Create Transaction</Button>
      </div>

      <template v-else>
        <div v-for="group in store.groupedTransactions" :key="group.date" class="space-y-4">
          <h3 class="font-semibold text-muted-foreground uppercase tracking-wider text-sm sticky top-0 bg-background py-2">
            {{ settingsStore.formatDate(group.date) }}
          </h3>
          
          <div class="bg-card rounded-xl border shadow-sm divide-y">
            <div 
              v-for="tx in group.transactions" 
              :key="tx.id"
              class="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors group/tx"
            >
              <!-- Icon -->
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                :style="{ 
                  backgroundColor: getCategory(tx.categoryId)?.color ? `${getCategory(tx.categoryId)?.color}20` : '#88888820', 
                  color: getCategory(tx.categoryId)?.color || '#888888' 
                }"
              >
                <component :is="getIconComponent(getCategory(tx.categoryId)?.icon)" class="w-5 h-5" />
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-foreground truncate">
                    {{ tx.categoryName || 'Unknown Category' }}
                  </span>
                  <span class="text-xs text-muted-foreground">{{ dayjs(tx.transactionDate).format('HH:mm') }}</span>
                </div>
                <div class="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                  <span v-if="tx.type" class="inline-flex items-center gap-1">
                    <span 
                      class="w-2 h-2 rounded-full"
                      :class="tx.type === 'Income' ? 'bg-green-500' : 'bg-red-500'"
                    ></span>
                    {{ tx.type }}
                  </span>
                  <span class="mx-1.5 text-muted-foreground/40">•</span>
                  <span class="flex items-center gap-1">
                    <Icons.Building2 class="w-3 h-3 opacity-70" />
                    {{ tx.sourceName || 'Unknown' }}
                  </span>
                  <template v-if="tx.note">
                    <span class="mx-1.5 text-muted-foreground/40">•</span>
                    <span class="truncate">{{ tx.note }}</span>
                  </template>
                  <span class="mx-1.5 text-muted-foreground/40">•</span>
                  <span 
                    class="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                    :class="{
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': tx.status === 'Completed' || !tx.status,
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': tx.status === 'Pending',
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400': tx.status === 'Cancelled'
                    }"
                  >
                    {{ tx.status || 'Completed' }}
                  </span>
                </div>
              </div>

              <!-- Amount & Actions -->
              <div class="flex items-center gap-4 shrink-0">
                <span 
                  class="font-medium whitespace-nowrap"
                  :class="{
                    'text-green-600 dark:text-green-400': tx.type === 'Income',
                    'text-red-600 dark:text-red-400': tx.type === 'Expense'
                  }"
                >
                  {{ tx.type === 'Expense' ? '-' : (tx.type === 'Income' ? '+' : '') }}{{ settingsStore.formatCurrency(tx.amount) }}
                </span>
                
                <div class="flex items-center opacity-0 group-hover/tx:opacity-100 transition-opacity gap-1 min-w-[5rem] justify-end">
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100/50" @click="openDetailDialog(tx.id)" title="View Details">
                    <Icons.Eye class="w-4 h-4" />
                  </Button>
                  <Button v-if="tx.status === 'Pending'" variant="ghost" size="icon" class="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100/50" @click="markAsCompleted(tx.id)" title="Mark as Completed">
                    <Icons.CheckCircle class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-foreground" @click="openEditDialog(tx.id)" title="Edit">
                    <Icons.Pencil class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:bg-destructive/10" @click="confirmArchive(tx.id)" title="Delete">
                    <Icons.Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <TransactionDialog 
      v-model:open="dialogOpen" 
      :transaction-id="selectedTransactionId"
    />
    
    <TransactionDetailDialog 
      v-model:open="detailDialogOpen" 
      :transaction-id="selectedTransactionId"
    />
  </div>
</template>
