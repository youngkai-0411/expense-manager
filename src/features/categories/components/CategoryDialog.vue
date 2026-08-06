<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { categorySchema } from '../validators'
import { AVAILABLE_ICONS } from '../constants'
import { useCategoryStore } from '../stores/useCategoryStore'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Button from '@/components/ui/button/Button.vue'
import * as Icons from '@lucide/vue'
import type { CreateCategoryPayload } from '../types'

const props = defineProps<{
  open: boolean
  categoryId?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const store = useCategoryStore()

const isEditing = computed(() => !!props.categoryId)
const activeCategory = computed(() => 
  isEditing.value ? store.categories.find(c => c.id === props.categoryId) : null
)

// VeeValidate Form Setup
const { handleSubmit, resetForm, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(categorySchema),
  initialValues: {
    name: '',
    description: '',
    icon: 'Tag',
    color: '#4f46e5'
  }
})

const { value: name } = useField<string>('name')
const { value: description } = useField<string>('description')
const { value: icon } = useField<string>('icon')

// Populate form when editing
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (activeCategory.value) {
      resetForm({
        values: {
          name: activeCategory.value.name,
          description: activeCategory.value.description || '',
          icon: activeCategory.value.icon || 'Tag',
          color: activeCategory.value.color || '#4f46e5'
        }
      })
    } else {
      resetForm()
    }
  }
})

// Custom Icon Select Logic (since we don't have shadcn Select yet)
const showIconPicker = ref(false)

const getIconComponent = (iconName: string) => {
  return (Icons as Record<string, any>)[iconName] || Icons.Tag
}

const onSubmit = handleSubmit(async (values) => {
  try {
    const payload = values as CreateCategoryPayload
    if (isEditing.value && props.categoryId) {
      await store.updateCategory({ id: props.categoryId, ...payload })
    } else {
      await store.createCategory(payload)
    }
    emit('update:open', false)
  } catch (error) {
    // Error is handled in store (toast + throw)
  }
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <div class="flex flex-col space-y-1.5 text-center sm:text-left">
        <DialogTitle>{{ isEditing ? 'Edit Category' : 'New Category' }}</DialogTitle>
        <DialogDescription>
          Fill in the details for this category.
        </DialogDescription>
      </div>
      
      <form @submit="onSubmit" class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="name" placeholder="e.g. Salary" />
          <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Input id="description" v-model="description" placeholder="Optional description..." />
          <p v-if="errors.description" class="text-xs text-destructive">{{ errors.description }}</p>
        </div>

        <div class="space-y-2 relative">
          <Label>Icon</Label>
          <button 
            type="button"
            @click="showIconPicker = !showIconPicker"
            class="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div class="flex items-center gap-2">
              <component :is="getIconComponent(icon)" class="w-4 h-4 text-primary" />
              <span>{{ icon }}</span>
            </div>
            <span class="text-muted-foreground">▼</span>
          </button>
          
          <div 
            v-if="showIconPicker"
            class="absolute z-50 mt-1 w-full bg-popover rounded-md shadow-md border border-border p-2 max-h-48 overflow-y-auto"
          >
            <div class="grid grid-cols-5 gap-1">
              <button
                v-for="i in AVAILABLE_ICONS"
                :key="i"
                type="button"
                @click="icon = i; showIconPicker = false"
                class="flex flex-col items-center p-2 rounded-md hover:bg-accent transition-colors"
                :class="icon === i ? 'bg-accent ring-1 ring-ring' : ''"
              >
                <component :is="getIconComponent(i)" class="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : 'Save' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
