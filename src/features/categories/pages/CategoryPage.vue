<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCategoryStore } from '../stores/useCategoryStore'
import CategoryDialog from '../components/CategoryDialog.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import * as Icons from '@lucide/vue'

const store = useCategoryStore()

const dialogOpen = ref(false)
const selectedCategoryId = ref<number | null>(null)

const openCreateDialog = () => {
  selectedCategoryId.value = null
  dialogOpen.value = true
}

const openEditDialog = (id: number) => {
  selectedCategoryId.value = id
  dialogOpen.value = true
}

const confirmArchive = async (id: number) => {
  if (confirm('Are you sure you want to archive this category?')) {
    await store.archiveCategory(id)
  }
}

const getIconComponent = (iconName: string | null) => {
  return iconName && (Icons as Record<string, any>)[iconName] ? (Icons as Record<string, any>)[iconName] : Icons.Tag
}

onMounted(() => {
  store.loadCategories()
})
</script>

<template>
  <div class="p-8 max-w-5xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold tracking-tight">Categories</h1>
      <Button @click="openCreateDialog">
        <Icons.Plus class="w-4 h-4 mr-2" />
        New Category
      </Button>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-sm">
        <Icons.Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          v-model="store.searchQuery" 
          placeholder="Search categories..." 
          class="pl-9"
        />
      </div>
      <select 
        v-model="store.typeFilter"
        class="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="All">All Types</option>
        <option value="Expense">Expense</option>
        <option value="Income">Income</option>
      </select>
    </div>

    <!-- Content -->
    <div class="border rounded-md">
      <div v-if="store.isLoading" class="p-8 text-center text-muted-foreground">
        Loading categories...
      </div>
      
      <div v-else-if="store.filteredCategories.length === 0" class="p-12 text-center">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icons.Inbox class="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-medium">No categories found</h3>
        <p class="text-sm text-muted-foreground mt-1 mb-4">
          Get started by creating a new category.
        </p>
        <Button variant="outline" @click="openCreateDialog">Create Category</Button>
      </div>
      
      <table v-else class="w-full text-sm text-left">
        <thead class="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
          <tr>
            <th class="px-4 py-3 font-medium">Category</th>
            <th class="px-4 py-3 font-medium">Type</th>
            <th class="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr 
            v-for="category in store.filteredCategories" 
            :key="category.id"
            class="hover:bg-muted/50 transition-colors group"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                  :style="{ backgroundColor: category.color ? `${category.color}20` : '#4f46e520', color: category.color || '#4f46e5' }"
                >
                  <component :is="getIconComponent(category.icon)" class="w-4 h-4" />
                </div>
                <span class="font-medium">{{ category.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <span 
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                :class="category.type === 'Income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'"
              >
                {{ category.type }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" @click="openEditDialog(category.id)" title="Edit">
                  <Icons.Pencil class="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" class="text-destructive hover:text-destructive" @click="confirmArchive(category.id)" title="Archive">
                  <Icons.Archive class="w-4 h-4" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CategoryDialog 
      v-model:open="dialogOpen" 
      :category-id="selectedCategoryId"
    />
  </div>
</template>
