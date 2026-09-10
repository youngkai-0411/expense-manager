<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAccountStore } from '../stores/useAccountStore'
import Button from '@/components/ui/button/Button.vue'
import { toast } from 'vue-sonner'
import * as Icons from '@lucide/vue'
import dayjs from 'dayjs'
import AccountDialog from '../components/AccountDialog.vue'
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

const store = useAccountStore()

const dialogOpen = ref(false)
const editingAccount = ref<any>(null)
const deleteDialogOpen = ref(false)
const accountToDelete = ref<number | null>(null)

onMounted(() => {
  store.loadAccounts()
})

const openCreate = () => {
  editingAccount.value = null
  dialogOpen.value = true
}

const openEdit = (account: any) => {
  editingAccount.value = account
  dialogOpen.value = true
}

const handleDelete = (id: number) => {
  accountToDelete.value = id
  deleteDialogOpen.value = true
}

const executeDelete = async () => {
  if (accountToDelete.value) {
    try {
      await store.deleteAccount(accountToDelete.value)
      toast.success('Workspace permanently deleted.')
    } catch (e: any) {
      toast.error(e.message)
    }
    deleteDialogOpen.value = false
    accountToDelete.value = null
  }
}

const handleSetDefault = async (id: number) => {
  try {
    await store.setDefaultAccount(id)
    toast.success('Default workspace updated.')
  } catch (e: any) {
    toast.error(e.message)
  }
}
</script>

<template>
  <div class="h-full flex flex-col p-8 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Workspaces</h1>
        <p class="text-muted-foreground mt-1">Manage your separate financial accounts and workspaces.</p>
      </div>
      <Button @click="openCreate">
        <Icons.Plus class="w-4 h-4 mr-2" />
        New Workspace
      </Button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="acc in store.accounts" :key="acc.id" class="flex flex-col relative bg-card rounded-xl border shadow-sm p-6">
        <div v-if="acc.isDefault" class="absolute -top-3 -right-3">
          <div class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-sm">Default</div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="p-3 rounded-xl text-white shadow-sm" :style="{ backgroundColor: acc.color || '#3b82f6' }">
            <component :is="(Icons[(acc.icon || 'Briefcase') as keyof typeof Icons] as any)" class="w-6 h-6" />
          </div>
          
          <div class="flex items-center gap-1">
            <Button variant="ghost" size="icon" class="h-8 w-8" @click="openEdit(acc)" title="Edit">
              <Icons.Pencil class="w-4 h-4" />
            </Button>
            <Button v-if="!acc.isDefault" variant="ghost" size="icon" class="h-8 w-8" @click="handleSetDefault(acc.id)" title="Set Default">
              <Icons.Star class="w-4 h-4" />
            </Button>
            <Button 
              v-if="acc.id !== store.currentAccountId && !acc.isDefault" 
              variant="ghost" size="icon" class="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              @click="handleDelete(acc.id)" title="Delete Permanently"
            >
              <Icons.Trash class="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div class="mt-4">
          <h3 class="font-semibold text-lg">{{ acc.name }}</h3>
          <p class="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mt-1">
            {{ acc.description || 'No description provided.' }}
          </p>
        </div>
        
        <div class="flex-1 mt-4">
          <div class="flex flex-col gap-2 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <Icons.Calendar class="w-4 h-4" />
              Created {{ dayjs(acc.createdAt).format('MMM D, YYYY') }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <AccountDialog v-model:open="dialogOpen" :account="editingAccount" />

    <AlertDialog :open="deleteDialogOpen" @update:open="deleteDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete this workspace? 
            <br/><br/>
            <strong class="text-destructive">WARNING: All associated categories, sources, and transactions will also be permanently deleted!</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="deleteDialogOpen = false; accountToDelete = null">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="executeDelete" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Workspace</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
