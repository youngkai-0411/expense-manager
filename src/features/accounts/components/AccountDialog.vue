<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent } from '@/components/ui/dialog/index'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import { useAccountStore } from '../stores/useAccountStore'
import type { Account } from '../types'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  account?: Account | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const store = useAccountStore()

const name = ref('')
const description = ref('')
const icon = ref('Briefcase')
const color = ref('#3b82f6')
const loading = ref(false)

const availableIcons = ['Briefcase', 'User', 'Home', 'Coffee', 'Wallet', 'CreditCard', 'PiggyBank']
const availableColors = ['#3b82f6', '#10b981', '#a855f7', '#f97316', '#ef4444', '#eab308']

watch(() => props.open, (newVal) => {
  if (newVal) {
    if (props.account) {
      name.value = props.account.name
      description.value = props.account.description || ''
      icon.value = props.account.icon || 'Briefcase'
      color.value = props.account.color || '#3b82f6'
    } else {
      name.value = ''
      description.value = ''
      icon.value = 'Briefcase'
      color.value = '#3b82f6'
    }
  } else {
    // Prevent unclickable issue on radix-vue
    setTimeout(() => {
      document.body.style.pointerEvents = ''
    }, 100)
  }
})

const handleSave = async () => {
  if (!name.value.trim()) {
    toast.error('Name is required.')
    return
  }

  loading.value = true
  try {
    const data = {
      name: name.value,
      description: description.value,
      icon: icon.value,
      color: color.value
    }
    
    if (props.account) {
      await store.updateAccount(props.account.id, data)
      toast.success('Account updated successfully.')
    } else {
      await store.createAccount(data)
      toast.success('Account created successfully.')
    }
    emit('update:open', false)
  } catch (error: any) {
    toast.error(error.message || 'Something went wrong.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <div class="mb-4">
        <h2 class="text-lg font-semibold">{{ account ? 'Edit Workspace' : 'Create Workspace' }}</h2>
      </div>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="name" placeholder="e.g. Personal, Family" />
        </div>
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Input id="description" v-model="description" placeholder="Optional details..." />
        </div>
        <div class="grid gap-2">
          <Label>Icon</Label>
          <select v-model="icon" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <option v-for="i in availableIcons" :key="i" :value="i">
              {{ i }}
            </option>
          </select>
        </div>
        <div class="grid gap-2">
          <Label>Color</Label>
          <div class="flex gap-2">
            <button
              v-for="c in availableColors"
              :key="c"
              class="w-8 h-8 rounded-full border-2 transition-all"
              :class="color === c ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent hover:scale-110'"
              :style="{ backgroundColor: c }"
              @click="color = c"
            />
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <Button variant="outline" @click="emit('update:open', false)">Cancel</Button>
        <Button @click="handleSave" :disabled="loading">
          {{ loading ? 'Saving...' : 'Save' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
