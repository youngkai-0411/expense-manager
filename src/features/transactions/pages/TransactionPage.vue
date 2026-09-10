<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const store = useTransactionStore()
const categoryStore = useCategoryStore()
const sourceStore = useSourceStore()
const settingsStore = useSettingsStore()

const dialogOpen = ref(false)
const detailDialogOpen = ref(false)
const selectedTransactionId = ref<number | null>(null)
const deleteDialogOpen = ref(false)
const transactionToDelete = ref<number | null>(null)

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

const confirmDelete = (id: number) => {
  transactionToDelete.value = id
  deleteDialogOpen.value = true
}

const executeDelete = async () => {
  if (transactionToDelete.value) {
    await store.deleteTransaction(transactionToDelete.value)
    deleteDialogOpen.value = false
    transactionToDelete.value = null
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

const categoryIdFilter = computed({
  get: () => store.categoryFilter === 'All' ? 'All' : store.categoryFilter.toString(),
  set: (val: any) => store.categoryFilter = val === 'All' ? 'All' : parseInt(val)
})

const sourceIdFilter = computed({
  get: () => store.sourceFilter === 'All' ? 'All' : store.sourceFilter.toString(),
  set: (val: any) => store.sourceFilter = val === 'All' ? 'All' : parseInt(val)
})

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
    <div class="flex flex-wrap md:flex-nowrap items-center gap-3 bg-card p-3 rounded-lg border shadow-sm">
      <div class="relative flex-1 min-w-[200px]">
        <Icons.Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          v-model="store.searchQuery" 
          placeholder="Search notes..." 
          class="pl-9 h-9"
        />
      </div>
      
      <Select v-model="store.typeFilter">
        <SelectTrigger class="h-9 w-[130px] flex-shrink-0">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Types</SelectItem>
          <SelectItem value="Income">Income</SelectItem>
          <SelectItem value="Expense">Expense</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="store.statusFilter">
        <SelectTrigger class="h-9 w-[130px] flex-shrink-0">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Status</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="categoryIdFilter">
        <SelectTrigger class="h-9 w-[150px] flex-shrink-0">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Categories</SelectItem>
          <SelectItem v-for="c in categoryStore.categories" :key="c.id" :value="c.id.toString()">{{ c.name }}</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="sourceIdFilter">
        <SelectTrigger class="h-9 w-[150px] flex-shrink-0">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Sources</SelectItem>
          <SelectItem v-for="s in sourceStore.sources" :key="s.id" :value="s.id.toString()">{{ s.name }}</SelectItem>
        </SelectContent>
      </Select>
      
      <div class="ml-auto flex items-center gap-2 flex-shrink-0">
        <Select v-model="store.sortBy">
          <SelectTrigger class="h-9 w-[130px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="transactionDate">Date</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="source">Source</SelectItem>
            <SelectItem value="createdAt">Created</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" @click="store.sortDirection = store.sortDirection === 'desc' ? 'asc' : 'desc'" class="h-9 w-9 border" title="Toggle Sort Direction">
          <Icons.ArrowUpDown class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Timeline Content -->
    <div class="space-y-8">
      <div v-if="store.isLoading" class="space-y-6">
        <div v-for="i in 3" :key="i" class="space-y-4">
          <Skeleton class="h-5 w-32" />
          <div class="bg-card rounded-xl border shadow-sm divide-y">
            <div v-for="j in 2" :key="j" class="p-4 flex items-center gap-4">
              <Skeleton class="w-10 h-10 rounded-full shrink-0" />
              <div class="flex-1 space-y-2">
                <Skeleton class="h-4 w-[200px]" />
                <Skeleton class="h-3 w-[150px]" />
              </div>
              <Skeleton class="h-5 w-20 shrink-0" />
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="store.groupedTransactions.length === 0" class="p-16 text-center border-2 border-dashed rounded-xl bg-card shadow-sm">
        <div class="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icons.ReceiptText class="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 class="text-lg font-medium">No transactions found</h3>
        <p class="text-sm text-muted-foreground mt-1 mb-6">
          Try adjusting your filters or create a new transaction.
        </p>
        <Button @click="openCreateDialog">
          <Icons.Plus class="w-4 h-4 mr-2" />
          Create Transaction
        </Button>
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
              <div class="flex items-center shrink-0">
                <div class="w-32 text-right">
                  <span 
                    class="font-medium whitespace-nowrap"
                    :class="{
                      'text-green-600 dark:text-green-400': tx.type === 'Income',
                      'text-red-600 dark:text-red-400': tx.type === 'Expense'
                    }"
                  >
                    {{ tx.type === 'Expense' ? '-' : (tx.type === 'Income' ? '+' : '') }}{{ settingsStore.formatCurrency(tx.amount) }}
                  </span>
                </div>
                
                <div class="flex items-center opacity-0 group-hover/tx:opacity-100 transition-opacity gap-1 w-36 justify-end ml-4">
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100/50" @click="openDetailDialog(tx.id)" title="View Details">
                    <Icons.Eye class="w-4 h-4" />
                  </Button>
                  <Button v-if="tx.status === 'Pending'" variant="ghost" size="icon" class="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100/50" @click="markAsCompleted(tx.id)" title="Mark as Completed">
                    <Icons.CheckCircle class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-foreground" @click="openEditDialog(tx.id)" title="Edit">
                    <Icons.Pencil class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:bg-destructive/10" @click="confirmDelete(tx.id)" title="Delete">
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

    <AlertDialog :open="deleteDialogOpen" @update:open="deleteDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this transaction.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="deleteDialogOpen = false; transactionToDelete = null">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="executeDelete" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
