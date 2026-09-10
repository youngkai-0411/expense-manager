<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { transactionSchema } from '../validators'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useCategoryStore } from '@/features/categories/stores/useCategoryStore'
import { useSourceStore } from '@/features/sources/stores/useSourceStore'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Button from '@/components/ui/button/Button.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CreateTransactionPayload } from '../types'
import dayjs from 'dayjs'

const props = defineProps<{
  open: boolean
  transactionId?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const store = useTransactionStore()
const categoryStore = useCategoryStore()
const sourceStore = useSourceStore()

const isEditing = computed(() => !!props.transactionId)
const activeTransaction = computed(() => 
  isEditing.value ? store.transactions.find((t: any) => t.id === props.transactionId) : null
)

if (categoryStore.categories.length === 0) categoryStore.loadCategories()
if (sourceStore.sources.length === 0) sourceStore.loadSources()

const { handleSubmit, resetForm, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(transactionSchema),
  initialValues: {
    categoryId: undefined,
    sourceId: undefined,
    type: 'Expense',
    amount: 0,
    transactionDate: dayjs().format('YYYY-MM-DDTHH:mm'),
    completedDate: undefined,
    note: '',
    status: 'Completed'
  }
})

const { value: categoryId } = useField<number>('categoryId')
const { value: sourceId } = useField<number | null>('sourceId')
const { value: type } = useField<'Income' | 'Expense'>('type')
const { value: amount } = useField<number>('amount')
const { value: transactionDate } = useField<string>('transactionDate')
const { value: completedDate } = useField<string | undefined>('completedDate')
const { value: note } = useField<string>('note')
const { value: status } = useField<'Pending' | 'Completed'>('status')

const activeCategories = computed(() => categoryStore.categories.filter(c => !c.isArchived))
const activeSources = computed(() => sourceStore.sources.filter(s => s.isActive))

const categoryIdStr = computed({
  get: () => categoryId.value ? categoryId.value.toString() : undefined,
  set: (val: any) => categoryId.value = val ? parseInt(val) : undefined as any
})

const sourceIdStr = computed({
  get: () => sourceId.value ? sourceId.value.toString() : undefined,
  set: (val: any) => sourceId.value = val ? parseInt(val) : undefined as any
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (activeTransaction.value) {
      resetForm({
        values: {
          categoryId: activeTransaction.value.categoryId,
          sourceId: activeTransaction.value.sourceId || undefined,
          type: activeTransaction.value.type,
          amount: activeTransaction.value.amount,
          transactionDate: dayjs(activeTransaction.value.transactionDate).format('YYYY-MM-DDTHH:mm'),
          completedDate: activeTransaction.value.completedDate ? dayjs(activeTransaction.value.completedDate).format('YYYY-MM-DDTHH:mm') : undefined,
          note: activeTransaction.value.note || '',
          status: activeTransaction.value.status as 'Pending' | 'Completed' || 'Completed'
        }
      })
    } else {
      resetForm({
        values: {
          categoryId: undefined,
          sourceId: undefined,
          type: 'Expense',
          amount: 0,
          transactionDate: dayjs().format('YYYY-MM-DDTHH:mm'),
          completedDate: undefined,
          note: '',
          status: 'Completed'
        }
      })
    }
  } else {
    // Radix Dialog sometimes leaves pointer-events: none on the body if it closes abruptly.
    // This explicitly cleans it up to prevent the UI from becoming unclickable.
    setTimeout(() => {
      document.body.style.pointerEvents = ''
    }, 100)
  }
})

const onSubmit = handleSubmit(async (values) => {
  try {
    const payload = values as CreateTransactionPayload
    payload.transactionDate = dayjs(payload.transactionDate).toISOString()
    
    // If status is completed but completedDate is not set or not in the payload
    if (payload.status === 'Completed') {
      payload.completedDate = payload.completedDate ? dayjs(payload.completedDate).toISOString() : payload.transactionDate
    } else {
      payload.completedDate = undefined
    }

    if (isEditing.value && props.transactionId) {
      await store.updateTransaction({ id: props.transactionId, ...payload })
    } else {
      await store.createTransaction(payload)
    }
    
    // Slight delay to allow state changes to settle before closing, avoiding Radix issues
    setTimeout(() => {
      emit('update:open', false)
    }, 50)
  } catch (error) {
    // Error handled in store
  }
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <div class="flex flex-col space-y-1.5 text-center sm:text-left mb-2">
        <DialogTitle>{{ isEditing ? 'Edit Transaction' : 'New Transaction' }}</DialogTitle>
        <DialogDescription>
          Fill in the transaction details below.
        </DialogDescription>
      </div>
      
      <form @submit.prevent="onSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label>Type</Label>
          <div class="flex gap-4 items-center h-10">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="type" value="Income" class="accent-primary" />
              <span>Income</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="type" value="Expense" class="accent-primary" />
              <span>Expense</span>
            </label>
          </div>
          <p v-if="errors.type" class="text-xs text-destructive">{{ errors.type }}</p>
        </div>

        <div class="space-y-2">
          <Label for="amount">Amount</Label>
          <Input 
            id="amount" 
            type="number" 
            v-model.number="amount" 
            min="0.01"
            step="any"
            class="font-mono"
            autofocus
            @keydown.enter.prevent="onSubmit"
          />
          <p v-if="errors.amount" class="text-xs text-destructive">{{ errors.amount }}</p>
        </div>

        <div class="space-y-2">
          <Label for="categoryId">Category</Label>
          <Select v-model="categoryIdStr">
            <SelectTrigger id="categoryId">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in activeCategories" :key="c.id" :value="c.id.toString()">
                {{ c.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.categoryId" class="text-xs text-destructive">{{ errors.categoryId }}</p>
        </div>

        <div class="space-y-2">
          <Label for="sourceId">Source</Label>
          <Select v-model="sourceIdStr">
            <SelectTrigger id="sourceId">
              <SelectValue placeholder="Select Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="s in activeSources" :key="s.id" :value="s.id.toString()">
                {{ s.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.sourceId" class="text-xs text-destructive">{{ errors.sourceId }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="transactionDate">Transaction Date</Label>
            <Input 
              id="transactionDate" 
              type="datetime-local" 
              v-model="transactionDate" 
              @keydown.enter.prevent="onSubmit"
            />
            <p v-if="errors.transactionDate" class="text-xs text-destructive">{{ errors.transactionDate }}</p>
          </div>
          
          <div class="space-y-2">
            <Label for="status">Status</Label>
            <Select v-model="status">
              <SelectTrigger id="status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.status" class="text-xs text-destructive">{{ errors.status }}</p>
          </div>
        </div>

        <div v-if="status === 'Completed'" class="space-y-2">
          <Label for="completedDate">Completed Date</Label>
          <Input 
            id="completedDate" 
            type="datetime-local" 
            v-model="completedDate" 
            @keydown.enter.prevent="onSubmit"
          />
          <p v-if="errors.completedDate" class="text-xs text-destructive">{{ errors.completedDate }}</p>
        </div>

        <div class="space-y-2">
          <Label for="note">Note</Label>
          <Input id="note" v-model="note" placeholder="Optional notes..." @keydown.enter.prevent="onSubmit" />
          <p v-if="errors.note" class="text-xs text-destructive">{{ errors.note }}</p>
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
