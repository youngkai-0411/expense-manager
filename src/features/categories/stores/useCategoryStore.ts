import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoryApi } from '../ipc'
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../types'
import { toast } from 'vue-sonner'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Filters
  const searchQuery = ref('')

  // Computed
  const activeCategories = computed(() => categories.value)
  
  const filteredCategories = computed(() => {
    let result = activeCategories.value

    if (searchQuery.value) {
      const lowerQuery = searchQuery.value.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(lowerQuery))
    }

    return result
  })

  // Actions
  const loadCategories = async () => {
    isLoading.value = true
    error.value = null
    try {
      categories.value = await categoryApi.getAll()
    } catch (e: any) {
      error.value = e.message || 'Failed to load categories'
      toast.error(error.value as string)
    } finally {
      isLoading.value = false
    }
  }

  const createCategory = async (payload: CreateCategoryPayload) => {
    // Unique name validation
    const duplicate = categories.value.find(
      c => c.name.toLowerCase() === payload.name.toLowerCase()
    )
    if (duplicate) {
      throw new Error(`Category "${payload.name}" already exists.`)
    }

    try {
      const newCat = await categoryApi.create(payload)
      categories.value.unshift(newCat)
      toast.success('Category created successfully')
      return newCat
    } catch (e: any) {
      const msg = e.message || 'Failed to create category'
      toast.error(msg)
      throw new Error(msg)
    }
  }

  const updateCategory = async (payload: UpdateCategoryPayload) => {
    // Unique name validation (excluding self)
    if (payload.name) {
      const duplicate = categories.value.find(
        c => c.id !== payload.id && c.name.toLowerCase() === payload.name!.toLowerCase()
      )
      if (duplicate) {
        throw new Error(`Category "${payload.name}" already exists.`)
      }
    }

    try {
      const { id, ...data } = payload
      const updatedCat = await categoryApi.update(id, data)
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = updatedCat
      }
      toast.success('Category updated successfully')
      return updatedCat
    } catch (e: any) {
      const msg = e.message || 'Failed to update category'
      toast.error(msg)
      throw new Error(msg)
    }
  }

  const deleteCategory = async (id: number) => {
    try {
      await categoryApi.delete(id)
      categories.value = categories.value.filter(c => c.id !== id)
      toast.success('Category deleted')
    } catch (e: any) {
      const msg = e.message || 'Failed to delete category'
      toast.error(msg)
      throw new Error(msg)
    }
  }

  return {
    categories,
    isLoading,
    error,
    searchQuery,
    filteredCategories,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
})
