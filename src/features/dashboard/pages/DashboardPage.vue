<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '../stores/useDashboardStore'
import { useTransactionStore } from '@/features/transactions/stores/useTransactionStore'
import { useCategoryStore } from '@/features/categories/stores/useCategoryStore'
import { useSourceStore } from '@/features/sources/stores/useSourceStore'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import * as Icons from '@lucide/vue'
import dayjs from 'dayjs'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import TransactionDialog from '@/features/transactions/components/TransactionDialog.vue'
import CategoryDetailDialog from '../components/CategoryDetailDialog.vue'
import SourceDetailDialog from '../components/SourceDetailDialog.vue'
import { Doughnut, Bar } from 'vue-chartjs'
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title 
} from 'chart.js'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CategoryReportItem, SourceReportItem } from '../types'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const store = useDashboardStore()
const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const sourceStore = useSourceStore()
const settingsStore = useSettingsStore()
const router = useRouter()

// Automatically refresh dashboard when transactions change
transactionStore.$onAction(({ name, after }) => {
  if (['createTransaction', 'updateTransaction', 'updateStatus', 'archiveTransaction'].includes(name)) {
    after(() => {
      store.refresh()
    })
  }
})

const txDialogOpen = ref(false)
const categoryDetailOpen = ref(false)
const sourceDetailOpen = ref(false)
const selectedCategory = ref<CategoryReportItem | null>(null)
const selectedSource = ref<SourceReportItem | null>(null)

const openCreateTransaction = () => {
  txDialogOpen.value = true
}

const openCategoryDetail = (item: CategoryReportItem) => {
  selectedCategory.value = item
  categoryDetailOpen.value = true
}

const openSourceDetail = (item: SourceReportItem) => {
  selectedSource.value = item
  sourceDetailOpen.value = true
}

onMounted(async () => {
  await Promise.all([
    categoryStore.loadCategories(),
    sourceStore.loadSources(),
    store.loadDashboard()
  ])
})

let filterTimeout: any
watch(() => store.filters, () => {
  clearTimeout(filterTimeout)
  filterTimeout = setTimeout(() => {
    store.refresh()
  }, 300)
}, { deep: true })

// Derived Quick Insights
const quickInsights = computed(() => {
  const topExpCat = store.categoryReport.filter(c => c.expense > 0).sort((a, b) => b.expense - a.expense)[0]
  const topSrc = store.sourceReport.sort((a, b) => b.transactionCount - a.transactionCount)[0]
  
  return {
    topExpenseCategory: topExpCat ? topExpCat.name : '-',
    topSource: topSrc ? topSrc.name : '-',
    currentBalance: store.summary?.netBalance || 0
  }
})

// Charts data
const expensePieData = computed(() => {
  const categories = store.categoryReport.filter(c => c.expense > 0)
  return {
    labels: categories.map(c => c.name),
    datasets: [{
      backgroundColor: categories.map(c => c.color),
      data: categories.map(c => c.expense),
    }]
  }
})

const incomePieData = computed(() => {
  const categories = store.categoryReport.filter(c => c.income > 0)
  return {
    labels: categories.map(c => c.name),
    datasets: [{
      backgroundColor: categories.map(c => c.color),
      data: categories.map(c => c.income),
    }]
  }
})

const topSourcesBarData = computed(() => {
  const sources = store.sourceReport.slice(0, 5)
  return {
    labels: sources.map(s => s.name),
    datasets: [{
      label: 'Balance',
      backgroundColor: '#3b82f6',
      data: sources.map(s => s.balance),
    }]
  }
})

const trendBarData = computed(() => {
  return {
    labels: store.trend.map(t => dayjs(t.month).format('MMM YY')),
    datasets: [
      { label: 'Income', backgroundColor: '#10b981', data: store.trend.map(t => t.income) },
      { label: 'Expense', backgroundColor: '#ef4444', data: store.trend.map(t => t.expense) }
    ]
  }
})

const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' as const, labels: { usePointStyle: true, padding: 20 } } }, cutout: '70%' }
const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } }, scales: { x: { grid: { display: false } }, y: { border: { display: false } } } }

// Sorting Report Tables
const catSort = ref<'expense' | 'income' | 'balance'>('expense')
const srcSort = ref<'balance' | 'count'>('balance')

const sortedCategoryReport = computed(() => {
  return [...store.categoryReport].sort((a, b) => b[catSort.value] - a[catSort.value])
})

const sortedSourceReport = computed(() => {
  if (srcSort.value === 'count') return [...store.sourceReport].sort((a, b) => b.transactionCount - a.transactionCount)
  return [...store.sourceReport].sort((a, b) => b.balance - a.balance)
})

const categoryIdFilter = computed({
  get: () => store.filters.categoryId === 'All' ? 'All' : store.filters.categoryId?.toString() || 'All',
  set: (val: any) => store.filters.categoryId = val === 'All' ? 'All' : parseInt(val)
})

const sourceIdFilter = computed({
  get: () => store.filters.sourceId === 'All' ? 'All' : store.filters.sourceId?.toString() || 'All',
  set: (val: any) => store.filters.sourceId = val === 'All' ? 'All' : parseInt(val)
})
</script>

<template>
  <div class="p-8 max-w-[1400px] mx-auto space-y-8">
    <!-- Header & Global Filters -->
    <div class="flex flex-col gap-4 sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold tracking-tight">Dashboard & Reports</h1>
        <Button @click="openCreateTransaction">
          <Icons.Plus class="w-4 h-4 mr-2" />
          New Transaction
        </Button>
      </div>

      <div class="flex flex-wrap items-center gap-3 bg-card p-3 rounded-lg border shadow-sm">
        <div class="flex items-center gap-2">
          <Input type="date" v-model="store.filters.startDate" class="h-9 w-36" title="Start Date" />
          <span class="text-muted-foreground">-</span>
          <Input type="date" v-model="store.filters.endDate" class="h-9 w-36" title="End Date" />
        </div>
        
        <Select v-model="categoryIdFilter">
          <SelectTrigger class="h-9 w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem v-for="c in categoryStore.categories" :key="c.id" :value="c.id.toString()">{{ c.name }}</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="sourceIdFilter">
          <SelectTrigger class="h-9 w-36">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Sources</SelectItem>
            <SelectItem v-for="s in sourceStore.sources" :key="s.id" :value="s.id.toString()">{{ s.name }}</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="store.filters.type">
          <SelectTrigger class="h-9 w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Income">Income</SelectItem>
            <SelectItem value="Expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="store.filters.status">
          <SelectTrigger class="h-9 w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        <div v-if="store.isLoading" class="ml-auto text-sm text-muted-foreground flex items-center gap-2">
          <Icons.Loader2 class="w-4 h-4 animate-spin" />
          Updating...
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div class="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 class="tracking-tight text-sm font-medium">Total Income</h3>
          <Icons.ArrowDownLeft class="h-4 w-4 text-green-500" />
        </div>
        <div class="text-2xl font-bold font-mono tracking-tight text-green-600">{{ settingsStore.formatCurrency(store.summary?.totalIncome || 0) }}</div>
      </div>

      <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div class="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 class="tracking-tight text-sm font-medium">Total Expense</h3>
          <Icons.ArrowUpRight class="h-4 w-4 text-red-500" />
        </div>
        <div class="text-2xl font-bold font-mono tracking-tight text-red-600">{{ settingsStore.formatCurrency(store.summary?.totalExpense || 0) }}</div>
      </div>

      <div class="rounded-xl border bg-primary text-primary-foreground shadow-sm p-6 col-span-1 md:col-span-2 xl:col-span-2">
        <div class="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 class="tracking-tight text-sm font-medium opacity-90">Net Balance</h3>
          <Icons.Wallet class="h-4 w-4" />
        </div>
        <div class="text-3xl font-bold font-mono tracking-tight">
          {{ settingsStore.formatCurrency(store.summary?.netBalance || 0) }}
        </div>
      </div>

      <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6 opacity-90">
        <div class="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 class="tracking-tight text-sm font-medium">Pending Tasks</h3>
          <Icons.Clock class="h-4 w-4 text-amber-500" />
        </div>
        <div class="flex flex-col gap-1 mt-1">
          <div class="flex justify-between items-center">
            <span class="text-xs text-muted-foreground">Incoming</span>
            <span class="text-sm font-medium font-mono tracking-tight text-amber-600">+{{ settingsStore.formatCurrency(store.summary?.pendingIncome || 0) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-muted-foreground">Outgoing</span>
            <span class="text-sm font-medium font-mono tracking-tight text-amber-600">-{{ settingsStore.formatCurrency(store.summary?.pendingExpense || 0) }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div class="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 class="tracking-tight text-sm font-medium">Transactions</h3>
          <Icons.Activity class="h-4 w-4 text-muted-foreground" />
        </div>
        <div class="text-2xl font-bold">{{ store.summary?.totalTransactions || 0 }}</div>
      </div>
    </div>
    
    <!-- Quick Insights -->
    <div class="bg-primary/5 rounded-xl border p-4 flex flex-wrap gap-6 items-center">
      <div class="flex items-center gap-2">
        <Icons.Flame class="w-5 h-5 text-red-500" />
        <span class="text-sm font-medium">Top Expense Category:</span>
        <span class="text-sm text-muted-foreground">{{ quickInsights.topExpenseCategory }}</span>
      </div>
      <div class="flex items-center gap-2">
        <Icons.Building2 class="w-5 h-5 text-blue-500" />
        <span class="text-sm font-medium">Top Source:</span>
        <span class="text-sm text-muted-foreground">{{ quickInsights.topSource }}</span>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-xl border bg-card shadow-sm p-4 col-span-2">
        <h3 class="font-semibold mb-4">Monthly Income vs Expense</h3>
        <div class="h-[250px]">
          <Bar v-if="store.trend.length" :data="trendBarData" :options="barOptions" />
          <div v-else class="h-full flex items-center justify-center text-muted-foreground">No data available</div>
        </div>
      </div>
      
      <div class="rounded-xl border bg-card shadow-sm p-4">
        <h3 class="font-semibold mb-4">Top Sources by Balance</h3>
        <div class="h-[250px]">
          <Bar v-if="store.sourceReport.length" :data="topSourcesBarData" :options="barOptions" />
          <div v-else class="h-full flex items-center justify-center text-muted-foreground">No data available</div>
        </div>
      </div>
      
      <div class="rounded-xl border bg-card shadow-sm p-4">
        <h3 class="font-semibold mb-4">Expense by Category</h3>
        <div class="h-[250px]">
          <Doughnut v-if="expensePieData.datasets[0].data.length" :data="expensePieData" :options="pieOptions" />
          <div v-else class="h-full flex items-center justify-center text-muted-foreground">No data available</div>
        </div>
      </div>

      <div class="rounded-xl border bg-card shadow-sm p-4">
        <h3 class="font-semibold mb-4">Income by Category</h3>
        <div class="h-[250px]">
          <Doughnut v-if="incomePieData.datasets[0].data.length" :data="incomePieData" :options="pieOptions" />
          <div v-else class="h-full flex items-center justify-center text-muted-foreground">No data available</div>
        </div>
      </div>
      
      <!-- Recent Transactions Mini -->
      <div class="rounded-xl border bg-card shadow-sm p-4 flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold">Recent Transactions</h3>
          <Button variant="ghost" size="sm" @click="router.push('/transactions')">View All</Button>
        </div>
        <div class="flex-1 overflow-y-auto space-y-2 pr-2">
          <div v-for="tx in store.recentTransactions.slice(0, 5)" :key="tx.id" class="flex items-center justify-between text-sm p-2 hover:bg-muted rounded-md transition-colors">
            <div class="flex flex-col">
              <span class="font-medium truncate max-w-[120px]">{{ tx.categoryName }}</span>
              <span class="text-xs text-muted-foreground truncate max-w-[120px]">{{ tx.sourceName || 'Unknown' }}</span>
            </div>
            <div class="flex flex-col items-end">
              <span class="font-medium font-mono" :class="tx.categoryType === 'Income' ? 'text-green-600' : 'text-red-600'">
                {{ tx.categoryType === 'Income' ? '+' : '-' }}{{ settingsStore.formatCurrency(tx.amount) }}
              </span>
              <span class="text-[10px] uppercase text-muted-foreground">{{ tx.status }}</span>
            </div>
          </div>
          <div v-if="store.recentTransactions.length === 0" class="text-center text-muted-foreground py-4">No recent transactions</div>
        </div>
      </div>
    </div>

    <!-- Reports -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Category Report -->
      <div class="rounded-xl border bg-card shadow-sm flex flex-col flex-1 min-h-[400px]">
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="font-semibold">Top Categories</h3>
          <Select v-model="catSort">
            <SelectTrigger class="h-8 w-40 text-xs">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Sort by Expense</SelectItem>
              <SelectItem value="income">Sort by Income</SelectItem>
              <SelectItem value="balance">Sort by Balance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex-1 overflow-auto p-4 space-y-3">
          <div 
            v-for="cat in sortedCategoryReport" 
            :key="cat.categoryId" 
            class="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            @click="openCategoryDetail(cat)"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :style="{ backgroundColor: `${cat.color}20`, color: cat.color }">
                <span class="material-icons text-sm">{{ cat.icon }}</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-medium truncate">{{ cat.name }}</span>
                <span class="text-xs text-muted-foreground">{{ cat.percentage.toFixed(1) }}% of total expense</span>
              </div>
            </div>
            <div class="flex flex-col items-end shrink-0 pl-4">
              <span class="font-mono text-sm" :class="catSort === 'expense' ? 'text-red-600' : (catSort === 'income' ? 'text-green-600' : 'font-bold')">
                {{ settingsStore.formatCurrency(cat[catSort]) }}
              </span>
              <span class="text-[10px] text-muted-foreground">Bal: {{ settingsStore.formatCurrency(cat.balance) }}</span>
            </div>
          </div>
          <div v-if="sortedCategoryReport.length === 0" class="text-center text-muted-foreground py-8">No category data</div>
        </div>
      </div>

      <!-- Source Report -->
      <div class="rounded-xl border bg-card shadow-sm flex flex-col flex-1 min-h-[400px]">
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="font-semibold">Top Sources</h3>
          <Select v-model="srcSort">
            <SelectTrigger class="h-8 w-40 text-xs">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balance">Sort by Balance</SelectItem>
              <SelectItem value="count">Sort by Tx Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex-1 overflow-auto p-4 space-y-3">
          <div 
            v-for="src in sortedSourceReport" 
            :key="src.sourceId" 
            class="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            @click="openSourceDetail(src)"
          >
            <div class="flex flex-col min-w-0">
              <span class="font-medium truncate flex items-center gap-2">
                <Icons.Building2 class="w-4 h-4 text-blue-500" />
                {{ src.name }}
              </span>
              <span class="text-xs text-muted-foreground">{{ src.transactionCount }} transactions</span>
            </div>
            <div class="flex flex-col items-end shrink-0 pl-4">
              <span class="font-mono text-sm font-bold" :class="src.balance >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ settingsStore.formatCurrency(src.balance) }}
              </span>
              <span class="text-[10px] text-muted-foreground">
                <span class="text-green-600">+{{ settingsStore.formatCurrency(src.income) }}</span> | 
                <span class="text-red-600">-{{ settingsStore.formatCurrency(src.expense) }}</span>
              </span>
            </div>
          </div>
          <div v-if="sortedSourceReport.length === 0" class="text-center text-muted-foreground py-8">No source data</div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TransactionDialog v-model:open="txDialogOpen" />
    <CategoryDetailDialog v-model:open="categoryDetailOpen" :category="selectedCategory" :filters="store.filters" />
    <SourceDetailDialog v-model:open="sourceDetailOpen" :source="selectedSource" :filters="store.filters" />
  </div>
</template>
