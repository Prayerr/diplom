<template>
  <aside class="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 overflow-y-auto">
    <div class="p-4">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Заметки
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ваши заметки и задачи
        </p>
      </div>

      <div class="space-y-2 mb-6">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.key"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          :class="[
            isActive(item.key)
              ? 'bg-primary-500 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          <span class="font-medium">{{ item.label }}</span>
          <UBadge
            v-if="item.count !== undefined"
            :color="isActive(item.key) ? 'primary' : 'neutral'"
            variant="subtle"
            class="ml-auto"
          >
            {{ item.count }}
          </UBadge>
        </NuxtLink>
      </div>

      <UDivider class="my-6" />

      <div class="space-y-3">
        <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
          Статистика
        </h3>
        <div class="space-y-2 px-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Всего заметок</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ stats.total }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Активных</span>
            <span class="font-semibold text-primary-600 dark:text-primary-400">{{ stats.active }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Выполнено</span>
            <span class="font-semibold text-green-600 dark:text-green-400">{{ stats.completed }}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { NoteCategory } from '~/types/note'

const route = useRoute()
const { getStats } = useNotes()

const stats = computed(() => getStats())

const menuItems = computed(() => [
  {
    key: 'all' as NoteCategory,
    label: 'Все заметки',
    icon: 'i-heroicons-document-text',
    to: '/',
    count: stats.value.total
  },
  {
    key: 'active' as NoteCategory,
    label: 'Активные',
    icon: 'i-heroicons-clock',
    to: '/?category=active',
    count: stats.value.active
  },
  {
    key: 'completed' as NoteCategory,
    label: 'Выполненные',
    icon: 'i-heroicons-check-circle',
    to: '/?category=completed',
    count: stats.value.completed
  }
])

const isActive = (key: NoteCategory) => {
  const category = route.query.category as NoteCategory || 'all'
  return category === key
}
</script>
