<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Label as RadixLabel, type LabelProps } from 'radix-vue'

const props = defineProps<LabelProps & { class?: string }>()
</script>

<template>
  <RadixLabel
    v-bind="props"
    :class="cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', props.class)"
  >
    <slot />
  </RadixLabel>
</template>
