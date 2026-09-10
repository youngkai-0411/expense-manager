import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Account, NewAccount } from '../types'

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>([])
  const currentAccountId = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const defaultAccount = computed(() => accounts.value.find(a => a.isDefault))
  const currentAccountName = computed(() => {
    const acc = accounts.value.find(a => a.id === currentAccountId.value)
    return acc ? acc.name : 'Unknown'
  })
  const currentAccount = computed(() => accounts.value.find(a => a.id === currentAccountId.value))

  async function loadAccounts() {
    loading.value = true
    try {
      accounts.value = await window.ipcRenderer.invoke('account:getAll')
      const current = await window.ipcRenderer.invoke('account:getCurrentId')
      currentAccountId.value = current
    } catch (err: any) {
      error.value = err.message
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createAccount(data: NewAccount) {
    loading.value = true
    try {
      await window.ipcRenderer.invoke('account:create', data)
      await loadAccounts()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAccount(id: number, data: Partial<NewAccount>) {
    loading.value = true
    try {
      await window.ipcRenderer.invoke('account:update', id, data)
      await loadAccounts()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAccount(id: number) {
    loading.value = true
    try {
      await window.ipcRenderer.invoke('account:delete', id)
      await loadAccounts()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function setDefaultAccount(id: number) {
    loading.value = true
    try {
      await window.ipcRenderer.invoke('account:setDefault', id)
      await loadAccounts()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function switchAccount(id: number) {
    loading.value = true
    try {
      await window.ipcRenderer.invoke('account:switch', id)
      currentAccountId.value = id
      await loadAccounts()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    accounts,
    currentAccountId,
    loading,
    error,
    defaultAccount,
    currentAccountName,
    currentAccount,
    loadAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount,
    switchAccount
  }
})
