<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountStore } from '../stores/useAccountStore'
import Button from '@/components/ui/button/Button.vue'
import { Dialog, DialogContent } from '@/components/ui/dialog/index'
import * as Icons from '@lucide/vue'
import { toast } from 'vue-sonner'

const store = useAccountStore()
const router = useRouter()
const isOpen = ref(false)

onMounted(() => {
  store.loadAccounts()
})

const handleSwitch = async (id: number) => {
  if (id === store.currentAccountId) {
    isOpen.value = false
    return
  }
  
  try {
    await store.switchAccount(id)
    isOpen.value = false
    const account = store.accounts.find(a => a.id === id)
    toast.success(`Switched to "${account?.name}"`)
  } catch (err: any) {
    toast.error(err.message)
  }
}

const goToAccounts = () => {
  isOpen.value = false
  router.push('/accounts')
}

// Ensure radix unclickable issue doesn't happen
const handleOpenChange = (val: boolean) => {
  isOpen.value = val
  if (!val) {
    setTimeout(() => {
      document.body.style.pointerEvents = ''
    }, 100)
  }
}
</script>

<template>
  <div class="px-4 py-3 border-b border-border">
    <button 
      class="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors text-left"
      @click="isOpen = true"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white" :style="{ backgroundColor: store.currentAccount?.color || '#3b82f6' }">
          <component :is="(Icons[(store.currentAccount?.icon || 'Briefcase') as keyof typeof Icons] as any)" class="w-4 h-4" />
        </div>
        <div class="truncate">
          <div class="text-sm font-semibold truncate">{{ store.currentAccount?.name || 'Loading...' }}</div>
          <div class="text-xs text-muted-foreground">Workspace</div>
        </div>
      </div>
      <Icons.ChevronsUpDown class="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </button>

    <Dialog :open="isOpen" @update:open="handleOpenChange">
      <DialogContent class="sm:max-w-[600px] bg-background">
        <div class="mb-2">
          <h2 class="text-lg font-semibold">Switch Workspace</h2>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div 
            v-for="acc in store.activeAccounts" 
            :key="acc.id" 
            class="bg-card rounded-xl border shadow-sm cursor-pointer transition-all hover:border-primary/50 relative group p-4"
            :class="{ 'border-primary ring-1 ring-primary': acc.id === store.currentAccountId }"
            @click="handleSwitch(acc.id)"
          >
            <div v-if="acc.isDefault" class="absolute -top-2 -right-2">
              <div class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground shadow-sm">Default</div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl text-white shadow-sm flex items-center justify-center" :style="{ backgroundColor: acc.color || '#3b82f6' }">
                <component :is="(Icons[(acc.icon || 'Briefcase') as keyof typeof Icons] as any)" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-base font-semibold">{{ acc.name }}</h3>
                <p class="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {{ acc.description || 'No description' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-between items-center border-t border-border pt-4 mt-2">
          <span class="text-sm text-muted-foreground">Manage your workspaces</span>
          <Button variant="outline" size="sm" @click="goToAccounts">
            <Icons.Settings class="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
