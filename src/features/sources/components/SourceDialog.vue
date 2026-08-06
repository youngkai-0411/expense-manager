<script setup lang="ts">
import { watch, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { sourceSchema } from '../validators'
import { useSourceStore } from '../stores/useSourceStore'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Button from '@/components/ui/button/Button.vue'
import type { CreateSourcePayload } from '../types'

const props = defineProps<{
  open: boolean
  sourceId?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const store = useSourceStore()

const isEditing = computed(() => !!props.sourceId)
const activeSource = computed(() => 
  isEditing.value ? store.sources.find(s => s.id === props.sourceId) : null
)

// VeeValidate Form Setup
const { handleSubmit, resetForm, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(sourceSchema),
  initialValues: {
    name: '',
    description: '',
  }
})

const { value: name } = useField<string>('name')
const { value: description } = useField<string>('description')

// Populate form when editing
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (activeSource.value) {
      resetForm({
        values: {
          name: activeSource.value.name,
          description: activeSource.value.description || '',
        }
      })
    } else {
      resetForm()
    }
  }
})

const onSubmit = handleSubmit(async (values) => {
  try {
    const payload = values as CreateSourcePayload
    if (isEditing.value && props.sourceId) {
      await store.updateSource({ id: props.sourceId, ...payload })
    } else {
      await store.createSource(payload)
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
        <DialogTitle>{{ isEditing ? 'Edit Source' : 'New Source' }}</DialogTitle>
        <DialogDescription>
          Fill in the details for this source (e.g., Company, Bank, Shop).
        </DialogDescription>
      </div>
      
      <form @submit="onSubmit" class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="name" placeholder="e.g. Shopee" />
          <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
        </div>

        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Input id="description" v-model="description" placeholder="Optional description..." />
          <p v-if="errors.description" class="text-xs text-destructive">{{ errors.description }}</p>
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
