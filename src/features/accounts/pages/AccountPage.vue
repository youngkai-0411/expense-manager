<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAccountStore } from '../stores/useAccountStore'
import Button from '@/components/ui/button/Button.vue'
import { toast } from 'vue-sonner'
import * as Icons from '@lucide/vue'
import dayjs from 'dayjs'
import AccountDialog from '../components/AccountDialog.vue'

const store = useAccountStore()

const dialogOpen = ref(false)
const editingAccount = ref<any>(null)

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

const handleArchive = async (id: number) => {
  try {
    await store.archiveAccount(id)
    toast.success('Workspace archived.')
  } catch (e: any) {
    toast.error(e.message)
  }
}

const handleRestore = async (id: number) => {
  try {
    await store.restoreAccount(id)
    toast.success('Workspace restored.')
  } catch (e: any) {
    toast.error(e.message)
  }
}

const handleDelete = async (id: number) => {
  try {
    await store.deleteAccount(id)
    toast.success('Workspace permanently deleted.')
  } catch (e: any) {
    toast.error(e.message)
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
      <div v-for="acc in store.accounts" :key="acc.id" class="flex flex-col relative bg-card rounded-xl border shadow-sm p-6" :class="{ 'opacity-60': !acc.isActive }">
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
            <Button v-if="acc.isActive && !acc.isDefault && acc.id !== store.currentAccountId" variant="ghost" size="icon" class="h-8 w-8" @click="handleArchive(acc.id)" title="Archive">
              <Icons.Archive class="w-4 h-4" />
            </Button>
            <Button v-if="!acc.isActive" variant="ghost" size="icon" class="h-8 w-8" @click="handleRestore(acc.id)" title="Restore">
              <Icons.RefreshCw class="w-4 h-4" />
            </Button>
            <Button 
              v-if="!acc.isActive || (acc.id !== store.currentAccountId && !acc.isDefault)" 
              variant="ghost" size="icon" class="h-8 w-8 text-red-500 hover:text-red-600"
              @click="handleDelete(acc.id)" title="Delete"
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
            <div class="flex items-center gap-2">
              <Icons.Activity class="w-4 h-4" />
              {{ acc.isActive ? 'Active Workspace' : 'Archived Workspace' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <AccountDialog v-model:open="dialogOpen" :account="editingAccount" />
  </div>
</template>
