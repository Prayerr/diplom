export type NotePriority = 'low' | 'medium' | 'high'
export type NoteColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink' | 'gray' | 'none'
export type NoteCategory = 'all' | 'active' | 'completed'

export interface Note {
  id: string
  title: string
  content: string
  completed: boolean
  createdAt: string
  updatedAt: string
  priority?: NotePriority
  tags?: string[]
  color?: NoteColor
  dueDate?: string
  category?: string
}

export type SortOption = 'newest' | 'oldest' | 'priority' | 'title' | 'dueDate'
