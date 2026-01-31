import type { Note, NoteCategory, SortOption } from '~/types/note'

const STORAGE_KEY = 'notes-app-data'

export const useNotes = () => {
  const notes = useState<Note[]>('notes', () => [])

  const loadNotes = () => {
    if (process.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          notes.value = JSON.parse(stored)
        }
      } catch (error) {
        console.error('Ошибка загрузки заметок:', error)
        notes.value = []
      }
    }
  }

  const saveNotes = () => {
    if (process.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value))
      } catch (error) {
        console.error('Ошибка сохранения заметок:', error)
      }
    }
  }

  const addNote = (
    title: string,
    content: string = '',
    options?: {
      category?: string
      priority?: Note['priority']
      tags?: string[]
      color?: Note['color']
      dueDate?: string
    }
  ) => {
    const newNote: Note = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      title,
      content,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: options?.category,
      priority: options?.priority,
      tags: options?.tags,
      color: options?.color,
      dueDate: options?.dueDate
    }
    notes.value.unshift(newNote)
    saveNotes()
    return newNote
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    const index = notes.value.findIndex(note => note.id === id)
    if (index !== -1) {
      notes.value[index] = {
        ...notes.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveNotes()
      return notes.value[index]
    }
    return null
  }

  const deleteNote = (id: string) => {
    const index = notes.value.findIndex(note => note.id === id)
    if (index !== -1) {
      notes.value.splice(index, 1)
      saveNotes()
      return true
    }
    return false
  }

  const toggleNote = (id: string) => {
    const note = notes.value.find(n => n.id === id)
    if (note) {
      updateNote(id, { completed: !note.completed })
    }
  }

  const getFilteredNotes = (
    category: NoteCategory = 'all',
    sortBy: SortOption = 'newest',
    tagFilter?: string
  ) => {
    let result = [...notes.value]

    switch (category) {
      case 'active':
        result = result.filter(note => !note.completed)
        break
      case 'completed':
        result = result.filter(note => note.completed)
        break
    }

    if (tagFilter) {
      result = result.filter(note =>
        note.tags?.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()))
      )
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1, undefined: 0 }
        result.sort((a, b) => {
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          return bPriority - aPriority
        })
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'dueDate':
        result.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
        break
    }

    return result
  }

  const getAllTags = () => {
    const tagsSet = new Set<string>()
    notes.value.forEach(note => {
      note.tags?.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  }

  const getStats = () => {
    return {
      total: notes.value.length,
      active: notes.value.filter(n => !n.completed).length,
      completed: notes.value.filter(n => n.completed).length
    }
  }

  if (process.client && notes.value.length === 0) {
    loadNotes()
  }

  return {
    notes: readonly(notes),
    addNote,
    updateNote,
    deleteNote,
    toggleNote,
    getFilteredNotes,
    getAllTags,
    getStats,
    loadNotes,
    saveNotes
  }
}
