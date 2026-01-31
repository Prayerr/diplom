<template>
  <div class="space-y-3">
    <!-- Пустой список -->
    <div v-if="filteredNotes.length === 0">
      <div class="list-icon">
        <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      </div>
      <p class="text-gray-500 text-lg text-center">
        {{ emptyMessage }}
      </p>
      <p class="text-gray-400 text-sm mt-2 text-center">
        Создайте первую заметку или сбросьте фильтры
      </p>
    </div>

    <!-- Список заметок -->
    <TransitionGroup
      v-else
      name="list"
      tag="div"
      class="space-y-3"
    >
      <NoteItem
        v-for="note in filteredNotes"
        :key="note.id"
        :note="note"
        @edit="handleEdit"
        @delete="handleDelete"
        class="mb-3"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { Note, NoteCategory, SortOption } from '~/types/note'

interface Props {
  category?: NoteCategory
  sortBy?: SortOption
  tagFilter?: string
  searchQuery?: string
}

const props = withDefaults(defineProps<Props>(), {
  category: 'all',
  sortBy: 'newest',
  tagFilter: undefined,
  searchQuery: ''
})

const emit = defineEmits<{
  edit: [note: Note]
}>()

const { getFilteredNotes } = useNotes()

const filteredNotes = computed(() => {
  let notes = getFilteredNotes(props.category, props.sortBy, props.tagFilter)

  const query = props.searchQuery?.trim().toLowerCase()
  if (query) {
    notes = notes.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags?.some(t => t.toLowerCase().includes(query))
    )
  }

  return notes
})

const emptyMessage = computed(() => {
  if (props.searchQuery) return `Ничего не найдено по запросу "${props.searchQuery}"`
  if (props.tagFilter) return `Нет заметок с тегом "${props.tagFilter}"`
  if (props.category === 'active') return 'Нет активных заметок'
  if (props.category === 'completed') return 'Нет выполненных заметок'
  return 'Нет заметок'
})

const handleEdit = (note: Note) => {
  emit('edit', note)
}

const handleDelete = () => {
}
</script>

<style scoped>
.list-icon {
  display: flex;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
