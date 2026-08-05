<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettingsStore } from '../stores/useSettingsStore'
import * as Icons from '@lucide/vue'
import Button from '@/components/ui/button/Button.vue'
import Label from '@/components/ui/label/Label.vue'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const store = useSettingsStore()

const localTheme = computed({
  get: () => store.preferences.theme,
  set: (val) => store.saveSetting('theme', val)
})

const localCurrency = computed({
  get: () => store.preferences.currency,
  set: (val) => store.saveSetting('currency', val)
})

const localDateFormat = computed({
  get: () => store.preferences.date_format,
  set: (val) => store.saveSetting('date_format', val)
})

const localFirstDayOfWeek = computed({
  get: () => store.preferences.first_day_of_week,
  set: (val) => store.saveSetting('first_day_of_week', val)
})

const isResetDialogOpen = ref(false)
const isSeedDialogOpen = ref(false)

const handleReset = async () => {
  await store.resetData()
  isResetDialogOpen.value = false
  window.location.reload()
}

const handleSeed = async () => {
  await store.seedDemoData()
  isSeedDialogOpen.value = false
  window.location.reload()
}
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
      <p class="text-muted-foreground">Manage your application preferences and data.</p>
    </div>

    <!-- Appearance -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold border-b pb-2">Appearance</h2>
      <div class="bg-card p-6 rounded-xl border shadow-sm">
        <div class="space-y-4">
          <Label>Theme</Label>
          <div class="grid grid-cols-3 gap-4 max-w-md">
            <label class="relative flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              :class="{ 'border-primary bg-primary/5 ring-1 ring-primary': localTheme === 'light' }">
              <input type="radio" value="light" v-model="localTheme" class="sr-only" />
              <Icons.Sun class="w-6 h-6 mb-2" />
              <span class="text-sm font-medium">Light</span>
            </label>
            
            <label class="relative flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              :class="{ 'border-primary bg-primary/5 ring-1 ring-primary': localTheme === 'dark' }">
              <input type="radio" value="dark" v-model="localTheme" class="sr-only" />
              <Icons.Moon class="w-6 h-6 mb-2" />
              <span class="text-sm font-medium">Dark</span>
            </label>

            <label class="relative flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              :class="{ 'border-primary bg-primary/5 ring-1 ring-primary': localTheme === 'system' }">
              <input type="radio" value="system" v-model="localTheme" class="sr-only" />
              <Icons.Monitor class="w-6 h-6 mb-2" />
              <span class="text-sm font-medium">System</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- Localization -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold border-b pb-2">Localization</h2>
      <div class="bg-card p-6 rounded-xl border shadow-sm space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label>Currency</Label>
            <select 
              v-model="localCurrency"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="VND">Vietnamese Dong (VND)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

          <div class="space-y-2">
            <Label>Date Format</Label>
            <select 
              v-model="localDateFormat"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="dd/MM/yyyy">DD/MM/YYYY (e.g. 31/12/2024)</option>
              <option value="MM/dd/yyyy">MM/DD/YYYY (e.g. 12/31/2024)</option>
              <option value="yyyy-MM-dd">YYYY-MM-DD (e.g. 2024-12-31)</option>
            </select>
          </div>
          
          <div class="space-y-2">
            <Label>First Day of Week</Label>
            <select 
              v-model="localFirstDayOfWeek"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="Monday">Monday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Data Management -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold border-b pb-2">Data Management</h2>
      <div class="bg-card p-6 rounded-xl border shadow-sm space-y-6">
        
        <div class="flex items-center justify-between border-b pb-4 border-border">
          <div>
            <h3 class="font-medium">Seed Demo Data</h3>
            <p class="text-sm text-muted-foreground">Populate the app with sample categories and 50 random transactions.</p>
          </div>
          <Button variant="outline" @click="isSeedDialogOpen = true" :disabled="store.isLoading">
            <Icons.DatabaseZap class="w-4 h-4 mr-2" /> Seed Data
          </Button>
        </div>

        <div class="flex items-center justify-between pt-2">
          <div>
            <h3 class="font-medium text-destructive">Reset Application Data</h3>
            <p class="text-sm text-muted-foreground">Permanently delete all categories and transactions. Settings will remain.</p>
          </div>
          <Button variant="destructive" @click="isResetDialogOpen = true" :disabled="store.isLoading">
            <Icons.Trash2 class="w-4 h-4 mr-2" /> Reset Data
          </Button>
        </div>
        
      </div>
    </section>

    <!-- About -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold border-b pb-2">About</h2>
      <div class="bg-card p-6 rounded-xl border shadow-sm text-sm space-y-2">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Application</span>
          <span class="font-medium">Expense Tracker</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Version</span>
          <span class="font-medium">1.0.0</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Environment</span>
          <span class="font-medium text-xs font-mono bg-muted px-2 py-0.5 rounded">Electron + Vue 3 + SQLite</span>
        </div>
      </div>
    </section>

    <!-- Dialogs -->
    <Dialog :open="isSeedDialogOpen" @update:open="isSeedDialogOpen = $event">
      <DialogContent>
        <div class="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <DialogTitle>Seed Demo Data?</DialogTitle>
          <DialogDescription>
            This will insert mock categories and transactions into your database.
            If you already have existing data, this will just add more on top. Are you sure you want to proceed?
          </DialogDescription>
        </div>
        <div class="flex justify-end space-x-2 pt-4">
          <Button variant="outline" @click="isSeedDialogOpen = false">Cancel</Button>
          <Button @click="handleSeed" :disabled="store.isLoading">Yes, Seed Data</Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog :open="isResetDialogOpen" @update:open="isResetDialogOpen = $event">
      <DialogContent>
        <div class="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <DialogTitle class="text-destructive">Reset Application Data?</DialogTitle>
          <DialogDescription>
            This will <span class="font-bold text-destructive">permanently delete</span> all your categories and transactions. 
            This action cannot be undone. Are you absolutely sure?
          </DialogDescription>
        </div>
        <div class="flex justify-end space-x-2 pt-4">
          <Button variant="outline" @click="isResetDialogOpen = false">Cancel</Button>
          <Button variant="destructive" @click="handleReset" :disabled="store.isLoading">Yes, Delete Everything</Button>
        </div>
      </DialogContent>
    </Dialog>

  </div>
</template>
