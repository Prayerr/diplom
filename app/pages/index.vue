<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="flex">
      <div class="hidden lg:block">
        <Sidebar />
      </div>

      <div class="flex-1">
        <header class="lg:hidden sticky top-0 z-40 backdrop-blur bg-gray-50/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800">
          <div class="p-3 flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <UButton
                color="neutral"
                variant="soft"
                icon="i-heroicons-bars-3"
                @click="isSidebarOpen = true"
              />
              <div class="min-w-0">
                <div class="font-semibold text-gray-900 dark:text-white truncate">
                  Заметки
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400 truncate">
                  Ваши заметки и задачи
                </div>
              </div>
            </div>

            <UButton
              color="neutral"
              variant="soft"
              icon="i-heroicons-plus"
              @click="scrollToForm"
            />
          </div>
        </header>

        <Transition name="fade">
          <div
            v-if="isSidebarOpen"
            class="lg:hidden fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
          >
            <div
              class="absolute inset-0 bg-black/40"
              @click="isSidebarOpen = false"
            />
            <div class="absolute left-0 top-0 h-full w-64 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </Transition>

        <main class="flex-1 p-4 sm:p-6 lg:p-8">
          <div class="max-w-4xl mx-auto space-y-6">
          <!-- Заголовок страницы -->
          <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ pageTitle }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              {{ pageDescription }}
            </p>
          </div>

          <!-- Форма добавления/редактирования заметки -->
          <div ref="formRef" class="scroll-mt-24">
            <NoteForm
              :note="editingNote"
              @submit="handleNoteSubmit"
              @cancel="cancelEdit"
            />
          </div>

          <!-- Фильтры и действия -->
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div class="flex items-center gap-2 flex-1 min-w-0 sm:min-w-64">
                <UInput
                  v-model="searchQuery"
                  placeholder="Поиск заметок..."
                  icon="i-heroicons-magnifying-glass"
                  class="flex-1"
                />
              </div>

              <div class="flex items-center gap-2">
                <UButton
                  v-if="selectedCategory === 'completed' && filteredNotes.length > 0"
                  color="red"
                  variant="soft"
                  icon="i-heroicons-trash"
                  @click="clearCompleted"
                >
                  Очистить выполненные
                </UButton>
              </div>
            </div>

            <!-- Быстрые теги -->
            <div v-if="allTags.length > 0" class="flex items-center gap-2 flex-wrap">
              <span class="text-sm text-gray-600 dark:text-gray-400">Быстрые теги:</span>
              <UBadge
                v-for="tag in allTags"
                :key="tag"
                :color="selectedTag === tag ? 'primary' : 'neutral'"
                variant="soft"
                class="cursor-pointer"
                @click="selectedTag = selectedTag === tag ? undefined : tag"
              >
                {{ tag }}
              </UBadge>
              <UButton
                v-if="selectedTag"
                color="gray"
                variant="ghost"
                size="xs"
                icon="i-heroicons-x-mark"
                @click="selectedTag = undefined"
              >
                Сбросить
              </UButton>
            </div>
          </div>  

          <!-- Список заметок -->
     <NotesList
      :category="selectedCategory"
      :sort-by="selectedSort"
      :tag-filter="selectedTag"
      :search-query="searchQuery"
      @edit="startEdit"
    />
        </div>
      </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Note, NoteCategory, SortOption } from '~/types/note'

const route = useRoute()
const { notes, addNote, updateNote, deleteNote, getFilteredNotes, getStats, loadNotes, getAllTags } = useNotes()

const isSidebarOpen = ref(false)
const formRef = ref<HTMLElement | null>(null)

const scrollToForm = () => {
  nextTick(() => {
    formRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

watch(
  () => route.fullPath,
  () => {
    isSidebarOpen.value = false
  }
)

watch(isSidebarOpen, (open) => {
  if (!process.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  loadNotes()
})

const selectedCategory = computed<NoteCategory>(() => {
  return (route.query.category as NoteCategory) || 'all'
})

const searchQuery = ref('')
const selectedSort = ref<SortOption>('newest')
const selectedTag = ref<string | undefined>(undefined)
const editingNote = ref<Note | null>(null)

const allTags = computed(() => getAllTags())
const filteredNotes = computed(() => {
  let result = getFilteredNotes(selectedCategory.value, selectedSort.value, selectedTag.value)
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  return result
})

const pageTitle = computed(() => {
  switch (selectedCategory.value) {
    case 'active':
      return 'Активные заметки'
    case 'completed':
      return 'Выполненные заметки'
    default:
      return 'Все заметки'
  }
})

const pageDescription = computed(() => {
  switch (selectedCategory.value) {
    case 'active':
      return 'Заметки, которые еще не выполнены'
    case 'completed':
      return 'Завершенные заметки и задачи'
    default:
      return 'Управляйте всеми вашими заметками и задачами'
  }
})

const handleNoteSubmit = (data: {
  title: string
  content: string
  priority?: Note['priority']
  tags?: string[]
  color?: Note['color']
  dueDate?: string
  images?: string[]
}) => {
  if (editingNote.value) {
    updateNote(editingNote.value.id, {
      title: data.title,
      content: data.content,
      priority: data.priority,
      tags: data.tags,
      color: data.color,
      dueDate: data.dueDate,
      images: data.images
    })
    editingNote.value = null
  } else {
    addNote(data.title, data.content, {
      priority: data.priority,
      tags: data.tags,
      color: data.color,
      dueDate: data.dueDate,
      images: data.images
    })
  }
}

const startEdit = (note: Note) => {
  editingNote.value = note
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

const cancelEdit = () => {
  editingNote.value = null
}

const clearCompleted = () => {
  if (confirm('Вы уверены, что хотите удалить все выполненные заметки?')) {
    const completedNotes = notes.value.filter(n => n.completed)
    completedNotes.forEach(note => deleteNote(note.id))
  }
}

useHead({
  title: 'Заметки - Приложение для заметок',
  meta: [
    { name: 'description', content: 'Веб-приложение для управления заметками и задачами' }
  ]
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
