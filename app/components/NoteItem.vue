<template>
  <UCard
    :class="[
      'transition-all duration-200 relative',
      note.completed ? 'opacity-75' : '',
      isExpanded ? 'shadow-lg' : '',
      getColorBorderClass(note.color)
    ]"
  >
    <!-- Цветовая метка слева -->
    <div
      v-if="note.color && note.color !== 'none'"
      :class="[
        'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
        getColorClass(note.color)
      ]"
    />

    <div class="flex items-start gap-3 pl-1">
      <UCheckbox
        :model-value="note.completed"
        @update:model-value="handleToggle"
        class="mt-1"
      />

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 min-w-0">
          <div class="flex-1 min-w-0 overflow-hidden">
            <!-- Заголовок на отдельной строке -->
            <div class="mb-2">
              <h3
                :class="[
                  'font-semibold text-lg mb-1 text-left',
                  note.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
                ]"
              >
                {{ note.title }}
              </h3>
              
          <p
                    v-if="note.content && !isExpanded"
                    class="text-sm mb-2 text-gray-400 italic text-left"
                  >
                    {{ truncatedContent }}
                  </p>

                  <!-- ПОЛНЫЙ текст -->
                  <Transition name="expand">
                    <p
                      v-if="note.content && isExpanded"
                      class="text-sm mb-2 text-left text-gray-600 dark:text-gray-400 break-words whitespace-normal"
                      :class="[
                        'text-sm mb-2 text-left',
                        note.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-600 dark:text-gray-400'
                      ]"
                    >
                      {{ note.content }}
                    </p>
                  </Transition>
            </div>

            <!-- Бейджи и метаданные -->
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <!-- Приоритет -->
              <UBadge
                v-if="note.priority"
                :color="getPriorityColor(note.priority)"
                variant="soft"
                size="xs"
              >
                {{ getPriorityLabel(note.priority) }}
              </UBadge>

              <!-- Дата выполнения -->
              <UBadge
                v-if="note.dueDate"
                :color="getDueDateColor(note.dueDate)"
                variant="soft"
                size="xs"
                icon="i-heroicons-calendar"
              >
                {{ formatDueDate(note.dueDate) }}
              </UBadge>
            </div>

            <!-- Теги -->
            <div v-if="note.tags && note.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
              <UBadge
                v-for="tag in note.tags"
                :key="tag"
                color="primary"
                variant="subtle"
                size="xs"
              >
                {{ tag }}
              </UBadge>
            </div>

            <div class="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <span>{{ formatDate(note.createdAt) }}</span>
              <span v-if="note.updatedAt !== note.createdAt">
                • Обновлено: {{ formatDate(note.updatedAt) }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <UButton
              v-if="note.content"
              :icon="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="isExpanded = !isExpanded"
            />
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-pencil"
              size="xs"
              @click="handleEdit"
            />
            <UButton
              color="red"
              variant="ghost"
              icon="i-heroicons-trash"
              size="xs"
              @click="handleDelete"
            />
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Note } from '~/types/note'

interface Props {
  note: Note
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [note: Note]
  delete: [id: string]
}>()

const { toggleNote, deleteNote } = useNotes()
const isExpanded = ref(false)

const handleToggle = () => {
  toggleNote(props.note.id)
}

const handleEdit = () => {
  emit('edit', props.note)
}

const handleDelete = () => {
  if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
    deleteNote(props.note.id)
    emit('delete', props.note.id)
  }
}

const truncatedContent = computed(() => {
  if (!props.note.content) return ''
  return props.note.content.length > 80
    ? props.note.content.slice(0, 80) + '...'
    : props.note.content
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return 'Сегодня'
  } else if (days === 1) {
    return 'Вчера'
  } else if (days < 7) {
    return `${days} дней назад`
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

const formatDueDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = dueDate.getTime() - today.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return 'Сегодня'
  } else if (days === 1) {
    return 'Завтра'
  } else if (days === -1) {
    return 'Вчера'
  } else if (days > 0 && days < 7) {
    return `Через ${days} дн.`
  } else if (days < 0) {
    return `Просрочено на ${Math.abs(days)} дн.`
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    })
  }
}

const getPriorityLabel = (priority: string) => {
  const labels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий'
  }
  return labels[priority as keyof typeof labels] || priority
}

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'neutral',
    medium: 'primary',
    high: 'error'
  }
  return colors[priority as keyof typeof colors] || 'neutral'
}

const getDueDateColor = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = dueDate.getTime() - today.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return 'error'
  if (days === 0) return 'warning'
  if (days <= 3) return 'warning'
  return 'success'
}

const getColorClass = (color: string) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-500'
  }
  return colors[color as keyof typeof colors] || ''
}

const getColorBorderClass = (color?: string) => {
  if (!color || color === 'none') return ''
  return 'border-l-4'
}
</script>
