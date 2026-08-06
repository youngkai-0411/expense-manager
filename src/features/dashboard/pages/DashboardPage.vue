<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '../stores/useDashboardStore'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import * as Icons from '@lucide/vue'
import dayjs from 'dayjs'
import Button from '@/components/ui/button/Button.vue'
import TransactionDialog from '@/features/transactions/components/TransactionDialog.vue'
import { Doughnut, Bar } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const store = useDashboardStore()
const settingsStore = useSettingsStore()
const router = useRouter()

const dialogOpen = ref(false)

const openCreateTransaction = () => {
  dialogOpen.value = true
}

onMounted(async () => {
  await store.loadDashboard()
})

const getIconComponent = (iconName?: string | null) => {
  if (!iconName) return Icons.CircleDollarSign
  return (Icons as Record<string, any>)[iconName] || Icons.CircleDollarSign
}

// Chart Data Computed Properties
const expensePieData = computed(() => {
  const categories = store.expenseByCategory
  return {
    labels: categories.map(c => c.name),
    datasets: [
      {
        backgroundColor: categories.map(c => c.color),
        data: categories.map(c => c.totalAmount),
      }
    ]
  }
})

const expensePieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 20
      }
    }
  },
  cutout: '70%',
}

const trendBarData = computed(() => {
  return {
    labels: store.trend.map(t => dayjs(t.month).format('MMM YY')),
    datasets: [
      {
        label: 'Income',
        backgroundColor: '#10b981', // Tailwind green-500
        data: store.trend.map(t => t.income)
      },
      {
        label: 'Expense',
        backgroundColor: '#ef4444', // Tailwind red-500
        data: store.trend.map(t => t.expense)
      }
    ]
  }
})

const trendBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    }
  },
  scales: {
    x: {
      grid: { display: false }
    },
    y: {
      border: { display: false },
      ticks: {
        callback: (value: any) => {
          if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
          if (value >= 1000) return (value / 1000).toFixed(0) + 'k'
          return value
        }
      }
    }
  }
}
</script>

<template>
  <div class="p-8 max-w-6xl mx-auto space-y-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground">{{ dayjs().format('MMMM YYYY') }}</p>
      </div>
      
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="store.refresh" :disabled="store.isLoading">
          <Icons.RefreshCcw class="w-4 h-4 mr-2" :class="{ 'animate-spin': store.isLoading }" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex gap-3">
      <Button @click="openCreateTransaction" class="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Icons.PlusCircle class="w-4 h-4 mr-2" /> New Transaction
      </Button>
      <Button @click="router.push('/transactions')" variant="secondary">
        <Icons.List class="w-4 h-4 mr-2" /> View Transactions
      </Button>
    </div>

    <div v-if="store.isLoading && !store.summary" class="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      <div v-for="i in 6" :key="i" class="h-28 bg-muted rounded-xl"></div>
    </div>

    <div v-else-if="store.summary" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
      <!-- Summary Cards -->
      <div class="bg-card rounded-xl p-5 border shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-center text-muted-foreground mb-3">
          <span class="font-medium text-sm">Income This Month</span>
          <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Icons.TrendingUp class="w-4 h-4 text-green-600 dark:text-green-500" />
          </div>
        </div>
        <div class="text-2xl font-bold text-foreground">
          {{ settingsStore.formatCurrency(store.summary.totalIncome) }}
        </div>
      </div>
      
      <div class="bg-card rounded-xl p-5 border shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-center text-muted-foreground mb-3">
          <span class="font-medium text-sm">Expense This Month</span>
          <div class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Icons.TrendingDown class="w-4 h-4 text-red-600 dark:text-red-500" />
          </div>
        </div>
        <div class="text-2xl font-bold text-foreground">
          {{ settingsStore.formatCurrency(store.summary.totalExpense) }}
        </div>
      </div>
      
      <div class="bg-card rounded-xl p-5 border shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-center text-muted-foreground mb-3">
          <span class="font-medium text-sm">Net Balance</span>
          <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icons.Scale class="w-4 h-4 text-primary" />
          </div>
        </div>
        <div class="text-2xl font-bold" :class="store.summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ store.summary.netBalance >= 0 ? '+' : '' }}{{ settingsStore.formatCurrency(store.summary.netBalance) }}
        </div>
      </div>

      <div class="bg-card rounded-xl p-5 border shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-center text-muted-foreground mb-3">
          <span class="font-medium text-sm">Transactions</span>
          <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Icons.ReceiptText class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div class="text-2xl font-bold text-foreground">
          {{ store.summary.totalTransactions }}
        </div>
      </div>

      <!-- Pending Summary Cards -->
      <div class="bg-card rounded-xl p-5 border shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-center text-muted-foreground mb-3">
          <span class="font-medium text-sm">Pending Income</span>
          <div class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Icons.Clock class="w-4 h-4 text-amber-600 dark:text-amber-500" />
          </div>
        </div>
        <div class="text-2xl font-bold text-amber-600 dark:text-amber-500">
          {{ settingsStore.formatCurrency(store.summary.pendingIncome || 0) }}
        </div>
      </div>

      <div class="bg-card rounded-xl p-5 border shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-center text-muted-foreground mb-3">
          <span class="font-medium text-sm">Pending Expense</span>
          <div class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Icons.Clock class="w-4 h-4 text-amber-600 dark:text-amber-500" />
          </div>
        </div>
        <div class="text-2xl font-bold text-amber-600 dark:text-amber-500">
          {{ settingsStore.formatCurrency(store.summary.pendingExpense || 0) }}
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Income vs Expense Trend -->
      <div class="bg-card rounded-xl border shadow-sm flex flex-col">
        <div class="p-5 border-b">
          <h2 class="font-semibold flex items-center gap-2">
            <Icons.BarChart3 class="w-4 h-4 text-muted-foreground" />
            Income vs Expense (6 Months)
          </h2>
        </div>
        <div class="p-5 flex-1 min-h-[300px] relative">
          <Bar v-if="store.trend.length > 0" :data="trendBarData" :options="trendBarOptions" />
          <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Icons.LineChart class="w-8 h-8 mb-2 opacity-50" />
            <p>No trend data available</p>
          </div>
        </div>
      </div>

      <!-- Expense by Category -->
      <div class="bg-card rounded-xl border shadow-sm flex flex-col">
        <div class="p-5 border-b">
          <h2 class="font-semibold flex items-center gap-2">
            <Icons.PieChart class="w-4 h-4 text-muted-foreground" />
            Expense by Category (This Month)
          </h2>
        </div>
        <div class="p-5 flex-1 min-h-[300px] relative">
          <Doughnut v-if="store.expenseByCategory.length > 0" :data="expensePieData" :options="expensePieOptions" />
          <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Icons.Donut class="w-8 h-8 mb-2 opacity-50" />
            <p>No expenses this month</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Categories -->
      <div class="bg-card rounded-xl border shadow-sm flex flex-col">
        <div class="p-5 border-b flex justify-between items-center">
          <h2 class="font-semibold flex items-center gap-2">
            <Icons.Trophy class="w-4 h-4 text-muted-foreground" />
            Top Expenses
          </h2>
          <span class="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">Current Month</span>
        </div>
        <div class="p-5 flex-1">
          <div v-if="store.expenseByCategory.length === 0" class="text-center text-muted-foreground py-8">
            No expenses found.
          </div>
          <div v-else class="space-y-4">
            <div v-for="cat in store.expenseByCategory.slice(0, 5)" :key="cat.categoryId" class="space-y-1.5">
              <div class="flex justify-between text-sm">
                <span class="font-medium flex items-center gap-2">
                  <span class="w-4 h-4 rounded flex items-center justify-center" :style="{ backgroundColor: cat.color + '30', color: cat.color }">
                    <component :is="getIconComponent(cat.icon)" class="w-3 h-3" />
                  </span>
                  {{ cat.name }}
                </span>
                <span class="font-semibold">{{ settingsStore.formatCurrency(cat.totalAmount) }}</span>
              </div>
              <div class="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all"
                  :style="{ 
                    width: `${(cat.totalAmount / (store.summary?.totalExpense || 1)) * 100}%`, 
                    backgroundColor: cat.color 
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="bg-card rounded-xl border shadow-sm flex flex-col">
        <div class="p-5 border-b flex justify-between items-center">
          <h2 class="font-semibold flex items-center gap-2">
            <Icons.History class="w-4 h-4 text-muted-foreground" />
            Recent Transactions
          </h2>
          <Button variant="ghost" size="sm" @click="router.push('/transactions')" class="h-7 text-xs">
            View All
          </Button>
        </div>
        <div class="p-0 flex-1 overflow-hidden">
          <div v-if="store.recentTransactions.length === 0" class="text-center text-muted-foreground py-14">
            <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Icons.ReceiptText class="w-6 h-6 opacity-50" />
            </div>
            <p>No transactions yet</p>
            <Button variant="link" @click="openCreateTransaction" class="mt-2">
              Create First Transaction
            </Button>
          </div>
          <div v-else class="divide-y">
            <div 
              v-for="tx in store.recentTransactions" 
              :key="tx.id"
              class="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer"
              @click="router.push('/transactions')"
            >
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                :style="{ backgroundColor: tx.categoryColor + '20', color: tx.categoryColor }"
              >
                <component :is="getIconComponent(tx.categoryIcon)" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-foreground truncate">
                  {{ tx.categoryName }}
                </div>
                <div class="text-xs text-muted-foreground truncate">
                  {{ dayjs(tx.transactionDate).format('MMM D, HH:mm') }}
                  <template v-if="tx.note"> &bull; {{ tx.note }}</template>
                </div>
              </div>
              <div 
                class="text-right font-semibold whitespace-nowrap text-sm"
                :class="{
                  'text-green-600 dark:text-green-400': tx.categoryType === 'Income',
                  'text-red-600 dark:text-red-400': tx.categoryType === 'Expense'
                }"
              >
                {{ tx.categoryType === 'Expense' ? '-' : '+' }}{{ settingsStore.formatCurrency(tx.amount) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reuse TransactionDialog for Quick Actions -->
    <TransactionDialog 
      v-model:open="dialogOpen"
      @update:open="!$event && store.refresh()"
    />
  </div>
</template>
