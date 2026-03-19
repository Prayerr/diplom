<template>
  <UCard class="overflow-visible" style="position: relative; z-index: 1">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">
          {{ isEditing ? "Редактировать заметку" : "Новая заметка" }}
        </h3>
        <UButton
          v-if="isEditing"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="cancelEdit"
        />
      </div>
    </template>

    <form @submit.prevent="handleSubmit">
      <div class="flex flex-col" style="gap: 6px; overflow: visible">
        <UInput
          v-model="formData.title"
          placeholder="Заголовок заметки"
          size="lg"
          required
        />

        <UTextarea
          v-model="formData.content"
          placeholder="Описание заметки (необязательно)"
          :rows="4"
        />

        <div class="flex flex-col sm:flex-row items-stretch gap-2">
          <div class="flex-1">
            <label
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
            >
              Приоритет
            </label>
              <UDropdownMenu
                :items="priorityOptions.map(o => ({
                  label: o.label,
                  onSelect: () => setPriority(o.value)
                }))"
                :ui="{ content: 'min-w-[160px]' }"
              >
                <UButton
                  type="button"
                  :label="formData.priority ? priorityLabels[formData.priority] : 'Выберите приоритет'"
                  trailing-icon="i-heroicons-chevron-down-20-solid"
                  color="neutral"
                  variant="outline"
                  class="w-full"
                />
              </UDropdownMenu>
          </div>

          <div class="flex-1">
            <label
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
            >
              Цветовая метка
            </label>
              <UDropdownMenu
                :items="colorOptions.map(o => ({
                  label: o.label,
                  onSelect: () => setColor(o.value)
                }))"
                :ui="{ content: 'min-w-[160px]' }"
              >
                <UButton
                  type="button"
                  :label="formData.color ? colorLabels[formData.color] : 'Выберите цвет'"
                  trailing-icon="i-heroicons-chevron-down-20-solid"
                  color="neutral"
                  variant="outline"
                  class="w-full"
                >
                  <template #leading>
                    <div
                      v-if="formData.color && formData.color !== 'none'"
                      :class="['w-3 h-3 rounded-full', colorDotClass(formData.color)]"
                    />
                  </template>
                </UButton>
              </UDropdownMenu>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex-1">
            <label
              class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
            >
              Дата выполнения
            </label>
            <UInput
              v-model="formData.dueDate"
              type="date"
              placeholder="Дата выполнения"
            />
          </div>
        </div>

        <div>
          <label
            class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
          >
            Изображения
          </label>
          <div class="flex flex-wrap gap-2 mb-2">
            <label
              class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <UIcon name="i-heroicons-photo" class="w-5 h-5 text-primary" />
              <span>Добавить изображение</span>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                multiple
                @change="onImagesSelected"
              />
            </label>
          </div>
          <div
            v-if="formData.images && formData.images.length > 0"
            class="flex flex-wrap gap-2"
          >
            <div
              v-for="(img, idx) in formData.images"
              :key="idx"
              class="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
            >
              <img
                :src="img"
                alt="Превью"
                class="w-16 h-16 sm:w-20 sm:h-20 object-cover"
              />
              <button
                type="button"
                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                @click="removeImage(idx)"
              >
                <UIcon name="i-heroicons-trash" class="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label
            class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
          >
            Теги (через запятую)
          </label>
          <UInput
            v-model="tagsInput"
            placeholder="Работа, Личное, Важно..."
            @blur="updateTags"
          />
          <div
            v-if="formData.tags && formData.tags.length > 0"
            class="flex flex-wrap gap-1 mt-2"
          >
            <UBadge
              v-for="tag in formData.tags"
              :key="tag"
              color="primary"
              variant="soft"
              class="cursor-pointer"
              @click="removeTag(tag)"
            >
              {{ tag }}
              <UIcon name="i-heroicons-x-mark" class="w-3 h-3 ml-1" />
            </UBadge>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch gap-2 pt-2">
          <UButton
            type="submit"
            :loading="isSubmitting"
            :disabled="!formData.title.trim()"
            class="w-full sm:flex-1"
          >
            {{ isEditing ? "Сохранить" : "Добавить" }}
          </UButton>
          <UButton
            v-if="isEditing"
            color="neutral"
            variant="ghost"
            @click="cancelEdit"
            class="w-full sm:w-auto"
          >
            Отмена
          </UButton>
        </div>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import type { Note, NotePriority, NoteColor } from "~/types/note";

interface Props {
  note?: Note | null;
}

const props = withDefaults(defineProps<Props>(), {
  note: null,
});

const emit = defineEmits<{
  submit: [
    note: {
      title: string;
      content: string;
      priority?: NotePriority;
      tags?: string[];
      color?: NoteColor;
      dueDate?: string;
      images?: string[];
    }
  ];
  cancel: [];
}>();

const formData = ref({
  title: "",
  content: "",
  priority: undefined as NotePriority | undefined,
  tags: [] as string[],
  color: undefined as NoteColor | undefined,
  dueDate: undefined as string | undefined,
  images: [] as string[],
});

const tagsInput = ref("");

const priorityOptions = [
  { label: "Низкий", value: "low" },
  { label: "Средний", value: "medium" },
  { label: "Высокий", value: "high" },
];

const priorityLabels: Record<string, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

const colorOptions = [
  { label: "Без цвета", value: "none" },
  { label: "Синий", value: "blue" },
  { label: "Зеленый", value: "green" },
  { label: "Желтый", value: "yellow" },
  { label: "Красный", value: "red" },
  { label: "Фиолетовый", value: "purple" },
  { label: "Розовый", value: "pink" },
  { label: "Серый", value: "gray" },
];

const colorLabels: Record<string, string> = {
  none: "Без цвета",
  blue: "Синий",
  green: "Зеленый",
  yellow: "Желтый",
  red: "Красный",
  purple: "Фиолетовый",
  pink: "Розовый",
  gray: "Серый",
};

function colorDotClass(color: string) {
  return {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    gray: "bg-gray-500",
  }[color];
}

const isSubmitting = ref(false);
const isEditing = computed(() => !!props.note);

const setPriority = (value: string) => {
  formData.value.priority = value as NotePriority;
};

const setColor = (value: string) => {
  formData.value.color = value as NoteColor;
};


watch(
  () => props.note,
  (note) => {
    if (note) {
      formData.value = {
        title: note.title,
        content: note.content,
        priority: note.priority,
        tags: note.tags || [],
        color: note.color,
        dueDate: note.dueDate,
        images: note.images ? [...note.images] : [],
      };
      tagsInput.value = note.tags?.join(", ") || "";
    } else {
      formData.value = {
        title: "",
        content: "",
        priority: undefined,
        tags: [],
        color: undefined,
        dueDate: undefined,
        images: [],
      };
      tagsInput.value = "";
    }
  },
  { immediate: true }
);

const updateTags = () => {
  if (tagsInput.value.trim()) {
    formData.value.tags = tagsInput.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  } else {
    formData.value.tags = [];
  }
};

const priorityMenuItems = computed(() =>
  priorityOptions.map(option => ({
    label: option.label,
    onSelect: () => setPriority(option.value)
  }))
)

const colorMenuItems = computed(() =>
  colorOptions.map(option => ({
    label: option.label,
    onSelect: () => setColor(option.value)
  }))
)

const removeTag = (tag: string) => {
  formData.value.tags = formData.value.tags?.filter((t) => t !== tag) || [];
  tagsInput.value = formData.value.tags.join(", ");
};

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const onImagesSelected = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (!files?.length) return;
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file || !file.type.startsWith("image/")) continue
    if (file.size > MAX_IMAGE_SIZE) continue
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      formData.value.images = [...(formData.value.images || []), dataUrl]
    }
    reader.readAsDataURL(file)
  }
  input.value = "";
};

const removeImage = (index: number) => {
  formData.value.images = formData.value.images?.filter((_, i) => i !== index) || [];
};

const handleSubmit = async () => {
  if (!formData.value.title.trim()) return;

  isSubmitting.value = true;

  try {
    updateTags();

    emit("submit", {
      title: formData.value.title.trim(),
      content: formData.value.content.trim(),
      priority: formData.value.priority,
      tags: formData.value.tags,
      color: formData.value.color,
      dueDate: formData.value.dueDate,
      images: formData.value.images?.length ? formData.value.images : undefined,
    });

    if (!isEditing.value) {
      formData.value = {
        title: "",
        content: "",
        priority: undefined,
        tags: [],
        color: undefined,
        dueDate: undefined,
        images: [],
      };
      tagsInput.value = "";
    }
  } finally {
    isSubmitting.value = false;
  }
};

const cancelEdit = () => {
  emit("cancel");
  formData.value = {
    title: "",
    content: "",
    priority: undefined,
    tags: [],
    color: undefined,
    dueDate: undefined,
    images: [],
  };
  tagsInput.value = "";
};
</script>
