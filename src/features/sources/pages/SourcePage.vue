<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSourceStore } from '../stores/useSourceStore'
import SourceDialog from '../components/SourceDialog.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import * as Icons from '@lucide/vue'

const store = useSourceStore()

const dialogOpen = ref(false)
const selectedSourceId = ref<number | null>(null)

const openCreateDialog = () => {
  selectedSourceId.value = null
  dialogOpen.value = true
}

const openEditDialog = (id: number) => {
  selectedSourceId.value = id
  dialogOpen.value = true
}



const confirmDelete = async (id: number) => {
  if (confirm('Are you sure you want to permanently delete this source? This action cannot be undone.')) {
    try {
      await store.deleteSource(id)
    } catch (e) {
      // toast already shown in store
    }
  }
}

onMounted(() => {
  store.loadSources()
})
</script>

<template>
  <div class="p-8 max-w-5xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold tracking-tight">Sources</h1>
      <Button @click="openCreateDialog">
        <Icons.Plus class="w-4 h-4 mr-2" />
        New Source
      </Button>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-sm">
        <Icons.Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          v-model="store.searchQuery" 
          placeholder="Search sources..." 
          class="pl-9"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="border rounded-md">
      <div v-if="store.isLoading" class="p-8 text-center text-muted-foreground">
        Loading sources...
      </div>
      
      <div v-else-if="store.filteredSources.length === 0" class="p-12 text-center">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icons.Inbox class="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-medium">No sources found</h3>
        <p class="text-sm text-muted-foreground mt-1 mb-4">
          Get started by creating a new source.
        </p>
        <Button variant="outline" @click="openCreateDialog">Create Source</Button>
      </div>
      
      <table v-else class="w-full text-sm text-left">
        <thead class="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
          <tr>
            <th class="px-4 py-3 font-medium">Name</th>
            <th class="px-4 py-3 font-medium">Description</th>
            <th class="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr 
            v-for="source in store.filteredSources" 
            :key="source.id"
            class="hover:bg-muted/50 transition-colors group"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                  <Icons.Building2 class="w-4 h-4" />
                </div>                <span class="font-medium">{{ source.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-muted-foreground">
              {{ source.description || '-' }}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" @click="openEditDialog(source.id)" title="Edit">
                  <Icons.Pencil class="w-4 h-4" />
                </Button>
                
                <Button variant="ghost" size="icon" class="text-destructive hover:text-destructive hover:bg-destructive/10" @click="confirmDelete(source.id)" title="Delete">
                  <Icons.Trash2 class="w-4 h-4" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <SourceDialog 
      v-model:open="dialogOpen" 
      :source-id="selectedSourceId"
    />
  </div>
</template>
