import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Source, CreateSourcePayload, UpdateSourcePayload } from '../types'
import { toast } from 'vue-sonner'

export const useSourceStore = defineStore('source', () => {
  const sources = ref<Source[]>([])
  const isLoading = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref<'All' | 'Active' | 'Archived'>('All')

  // Getters
  const activeSources = computed(() => sources.value.filter(s => s.isActive))
  const archivedSources = computed(() => sources.value.filter(s => !s.isActive))

  const filteredSources = computed(() => {
    let result = sources.value

    if (statusFilter.value === 'Active') {
      result = result.filter(s => s.isActive)
    } else if (statusFilter.value === 'Archived') {
      result = result.filter(s => !s.isActive)
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        (s.description?.toLowerCase() || '').includes(q)
      )
    }

    return result
  })

  // Actions
  const loadSources = async () => {
    isLoading.value = true
    try {
      const data = await window.ipcRenderer.invoke('source:getAll')
      sources.value = data
    } catch (error: any) {
      toast.error('Failed to load sources')
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  const createSource = async (payload: CreateSourcePayload) => {
    isLoading.value = true
    try {
      const newSource = await window.ipcRenderer.invoke('source:create', payload)
      sources.value.unshift(newSource)
      toast.success('Source created successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create source')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateSource = async (payload: UpdateSourcePayload) => {
    isLoading.value = true
    try {
      const { id, ...data } = payload
      const updated = await window.ipcRenderer.invoke('source:update', id, data)
      const index = sources.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sources.value[index] = updated
      }
      toast.success('Source updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update source')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const archiveSource = async (id: number) => {
    isLoading.value = true
    try {
      const archived = await window.ipcRenderer.invoke('source:archive', id)
      const index = sources.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sources.value[index] = archived
      }
      toast.success('Source archived')
    } catch (error: any) {
      toast.error('Failed to archive source')
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  const restoreSource = async (id: number) => {
    isLoading.value = true
    try {
      const restored = await window.ipcRenderer.invoke('source:restore', id)
      const index = sources.value.findIndex(s => s.id === id)
      if (index !== -1) {
        sources.value[index] = restored
      }
      toast.success('Source restored')
    } catch (error: any) {
      toast.error('Failed to restore source')
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  const deleteSource = async (id: number) => {
    isLoading.value = true
    try {
      await window.ipcRenderer.invoke('source:delete', id)
      sources.value = sources.value.filter(s => s.id !== id)
      toast.success('Source permanently deleted')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete source')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    sources,
    isLoading,
    searchQuery,
    statusFilter,
    activeSources,
    archivedSources,
    filteredSources,
    loadSources,
    createSource,
    updateSource,
    archiveSource,
    restoreSource,
    deleteSource
  }
})
