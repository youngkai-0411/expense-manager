<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Toaster } from 'vue-sonner'
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore'
import * as Icons from '@lucide/vue'

const route = useRoute()
const settingsStore = useSettingsStore()

onMounted(async () => {
  await settingsStore.loadSettings()
})
</script>

<template>
  <Toaster position="top-right" richColors />
  <div class="flex h-screen bg-background text-foreground transition-colors duration-200">
    <!-- Sidebar -->
    <aside class="w-64 bg-card border-r border-border flex flex-col transition-colors duration-200">
      <div class="h-16 flex items-center px-6 border-b border-border">
        <h1 class="text-xl font-bold text-primary flex items-center gap-2">
          <Icons.Wallet class="w-6 h-6" />
          Expense Tracker
        </h1>
      </div>
      <nav class="flex-1 py-4 px-3 space-y-1">
        <router-link 
          to="/" 
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
          :class="route.path === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
        >
          <Icons.LayoutDashboard class="w-4 h-4 mr-3" />
          Dashboard
        </router-link>
        <router-link 
          to="/transactions" 
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
          :class="route.path === '/transactions' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
        >
          <Icons.ReceiptText class="w-4 h-4 mr-3" />
          Transactions
        </router-link>
        <router-link 
          to="/categories"
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
          :class="route.path === '/categories' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
        >
          <Icons.Tags class="w-4 h-4 mr-3" />
          Categories
        </router-link>
        
        <div class="pt-4 mt-4 border-t border-border">
          <router-link 
            to="/data-management"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="route.path === '/data-management' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
          >
            <Icons.Database class="w-4 h-4 mr-3" />
            Data Management
          </router-link>

          <router-link 
            to="/settings"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors mt-1"
            :class="route.path === '/settings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
          >
            <Icons.Settings class="w-4 h-4 mr-3" />
            Settings
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
</style>
