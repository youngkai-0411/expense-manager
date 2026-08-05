<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { transactionSchema } from '../validators'
import { useTransactionStore } from '../stores/useTransactionStore'
import { useCategoryStore } from '@/features/categories/stores/useCategoryStore'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Button from '@/components/ui/button/Button.vue'
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

const isEditing = computed(() => !!props.transactionId)
const activeTransaction = computed(() => 
  isEditing.value ? store.transactions.find((t: any) => t.id === props.transactionId) : null
)

if (categoryStore.categories.length === 0) categoryStore.loadCategories()

const { handleSubmit, resetForm, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(transactionSchema),
  initialValues: {
    categoryId: undefined,
    amount: 0,
    transactionDate: dayjs().format('YYYY-MM-DDTHH:mm'),
    note: ''
  }
})

const { value: categoryId } = useField<number>('categoryId')
const { value: amount } = useField<number>('amount')
const { value: transactionDate } = useField<string>('transactionDate')
const { value: note } = useField<string>('note')

const incomeCategories = computed(() => categoryStore.categories.filter(c => !c.isArchived && c.type === 'Income'))
const expenseCategories = computed(() => categoryStore.categories.filter(c => !c.isArchived && c.type === 'Expense'))

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (activeTransaction.value) {
      resetForm({
        values: {
          categoryId: activeTransaction.value.categoryId,
          amount: activeTransaction.value.amount,
          transactionDate: dayjs(activeTransaction.value.transactionDate).format('YYYY-MM-DDTHH:mm'),
          note: activeTransaction.value.note || ''
        }
      })
    } else {
      resetForm({
        values: {
          categoryId: undefined,
          amount: 0,
          transactionDate: dayjs().format('YYYY-MM-DDTHH:mm'),
          note: ''
        }
      })
    }
  }
})

const onSubmit = handleSubmit(async (values) => {
  try {
    const payload = values as CreateTransactionPayload
    payload.transactionDate = dayjs(payload.transactionDate).toISOString()

    if (isEditing.value && props.transactionId) {
      await store.updateTransaction({ id: props.transactionId, ...payload })
    } else {
      await store.createTransaction(payload)
    }
    emit('update:open', false)
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
      
      <form @submit="onSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="categoryId">Category</Label>
          <select 
            id="categoryId" 
            v-model="categoryId"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option disabled :value="undefined">Select Category</option>
            <optgroup label="Expense" v-if="expenseCategories.length > 0">
              <option v-for="c in expenseCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </optgroup>
            <optgroup label="Income" v-if="incomeCategories.length > 0">
              <option v-for="c in incomeCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </optgroup>
          </select>
          <p v-if="errors.categoryId" class="text-xs text-destructive">{{ errors.categoryId }}</p>
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
          />
          <p v-if="errors.amount" class="text-xs text-destructive">{{ errors.amount }}</p>
        </div>
        
        <div class="space-y-2">
          <Label for="transactionDate">Date & Time</Label>
          <Input 
            id="transactionDate" 
            type="datetime-local" 
            v-model="transactionDate" 
          />
          <p v-if="errors.transactionDate" class="text-xs text-destructive">{{ errors.transactionDate }}</p>
        </div>

        <div class="space-y-2">
          <Label for="note">Note</Label>
          <Input id="note" v-model="note" placeholder="Optional notes..." />
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
