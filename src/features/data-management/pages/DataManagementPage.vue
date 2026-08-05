<script setup lang="ts">
import { ref } from 'vue'
import { useDataManagementStore } from '../stores/useDataManagementStore'
import * as Icons from '@lucide/vue'
import Button from '@/components/ui/button/Button.vue'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const store = useDataManagementStore()

const isRestoreDialogOpen = ref(false)

const handleRestore = async () => {
  isRestoreDialogOpen.value = false
  await store.restoreBackup()
}
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Data Management</h1>
      <p class="text-muted-foreground">Export your data or manage database backups.</p>
    </div>

    <!-- Export Section -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold border-b pb-2">Export Data</h2>
      <div class="bg-card p-6 rounded-xl border shadow-sm space-y-6">
        
        <div class="flex items-center justify-between border-b pb-4 border-border">
          <div>
            <h3 class="font-medium">Export Transactions (CSV)</h3>
            <p class="text-sm text-muted-foreground">Download all your transactions as a CSV file.</p>
          </div>
          <Button variant="outline" @click="store.exportTransactionsCsv" :disabled="store.isLoading">
            <Icons.FileText class="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        <div class="flex items-center justify-between border-b pb-4 border-border">
          <div>
            <h3 class="font-medium">Export Transactions (Excel)</h3>
            <p class="text-sm text-muted-foreground">Download all your transactions as a formatted Excel file.</p>
          </div>
          <Button variant="outline" @click="store.exportTransactionsExcel" :disabled="store.isLoading">
            <Icons.Table class="w-4 h-4 mr-2" /> Export Excel
          </Button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium">Export Categories (CSV)</h3>
            <p class="text-sm text-muted-foreground">Download a list of your categories.</p>
          </div>
          <Button variant="outline" @click="store.exportCategoriesCsv" :disabled="store.isLoading">
            <Icons.FileText class="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

      </div>
    </section>

    <!-- Backup Section -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold border-b pb-2">Database Backup</h2>
      <div class="bg-card p-6 rounded-xl border shadow-sm space-y-6">
        
        <div class="flex items-center justify-between border-b pb-4 border-border">
          <div>
            <h3 class="font-medium">Create Backup</h3>
            <p class="text-sm text-muted-foreground">Create a safe copy of your SQLite database.</p>
          </div>
          <Button variant="default" @click="store.createBackup" :disabled="store.isLoading">
            <Icons.DatabaseBackup class="w-4 h-4 mr-2" /> Create Backup
          </Button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-destructive">Restore Backup</h3>
            <p class="text-sm text-muted-foreground">Restore your database from a previously saved .db file.</p>
          </div>
          <Button variant="destructive" @click="isRestoreDialogOpen = true" :disabled="store.isLoading">
            <Icons.HardDriveDownload class="w-4 h-4 mr-2" /> Restore Backup
          </Button>
        </div>
        
      </div>
    </section>

    <!-- Restore Confirmation Dialog -->
    <Dialog :open="isRestoreDialogOpen" @update:open="isRestoreDialogOpen = $event">
      <DialogContent>
        <div class="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <DialogTitle class="text-destructive">Restore Database Backup?</DialogTitle>
          <DialogDescription>
            <span class="font-bold text-destructive">Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện tại.</span>
            Bạn có chắc chắn muốn tiếp tục?
          </DialogDescription>
        </div>
        <div class="flex justify-end space-x-2 pt-4">
          <Button variant="outline" @click="isRestoreDialogOpen = false">Cancel</Button>
          <Button variant="destructive" @click="handleRestore" :disabled="store.isLoading">Yes, Restore Backup</Button>
        </div>
      </DialogContent>
    </Dialog>

  </div>
</template>
