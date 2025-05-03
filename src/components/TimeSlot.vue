<script setup>
import { reactive, onMounted, computed, watch } from 'vue'
import { store } from '../store/store.js'

const props = defineProps({
  initialText: {
    type: String,
    default: ''
  },
  space: String,
  day: Date,
  time: Number,
})

const getKey = () => store.createKey(props.space, props.day, props.time)

const textareaState = reactive({
  text: props.initialText,
  date: props.day.toISOString().split('T')[0],
  hour: props.time,
  space: props.space,
  selected: false,
  editing: false
})

function asObject() {
  return {
    date: props.day.toISOString().split('T')[0],
    hour: props.time,
    space: props.space,
    client: textareaState.text
  }
}

const editingText = computed({
  get: () => store.editingText.value,
  set: (val) => { store.editingText.value = val }
})

watch(
  () => {
    const key = getKey()
    return store.textareaMap[key]
  },
  (newValue) => {
    if (newValue) {
      textareaState.text = newValue.text
      textareaState.selected = newValue.selected
      textareaState.editing = newValue.editing
    }
  },
  { deep: true }
)

onMounted(() => {

  store.registerTextarea(props.space, props.day, props.time, textareaState)

  const existing = store.getRegisteredTextArea(props.space, props.day, props.time)
})

function handleClick() {
  const someoneEditing = Object.values(store.textareaMap).some(ta => ta.editing)

  if (someoneEditing) {
    return
  }

  const newSelected = !textareaState.selected

  store.selectTextarea(props.space, props.day, props.time, newSelected)

}

function handleDoubleClick() {

  store.exitEditModeAll()

  store.setEditingMode(props.space, props.day, props.time, true)

  store.selectTextarea(props.space, props.day, props.time, true)

  setTimeout(() => {
    const textareaElement = document.querySelector('.textarea-edit')
    if (textareaElement) {
      textareaElement.focus()
    }
  }, 10)
}

function saveChanges() {
  if (textareaState.editing) {

    const newText = editingText.value

    store.applyTextToSelected(newText)

    store.setEditingMode(props.space, props.day, props.time, false)

    store.unselectAll()

  }
}

function handleKeyDown(event) {
  if (textareaState.editing) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      saveChanges()
    }
    if (event.key === 'Escape') {
      store.setEditingMode(props.space, props.day, props.time, false)
      store.unselectAll()
    }
  }
}
</script>

<template>
  <div class="textarea-wrapper" :class="{ selected: textareaState.selected, editing: textareaState.editing }"
    @click="handleClick" @dblclick="handleDoubleClick">
    <div v-if="!textareaState.editing" class="textarea-content">
      {{ textareaState.text }}
    </div>
    <textarea v-else v-model="editingText" @blur="saveChanges" @keydown="handleKeyDown" class="textarea-edit"
      placeholder="Enter text here" autofocus></textarea>
  </div>
</template>

<style scoped>
.textarea-wrapper {
  position: relative;
  font-size: small;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
  height: calc(0.5em * 2 + 20px);
  min-height: calc(0.5em * 2 + 20px);
  color: black;
  width: 100%;
  text-align: center;
  border-top: 1px solid #ccc;
}

.textarea-wrapper.selected {
  border-color: #4a90e2;
  background-color: #ccccff;
}

.textarea-wrapper.editing {
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.3);
}

.textarea-content {
  white-space: pre-wrap;
  box-sizing: border-box;
  overflow-y: auto;
  height: 100%;
  min-height: 100%;
  line-height: 1;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.textarea-edit {
  width: 100%;
  box-sizing: border-box;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: inherit;
  line-height: 1;
  height: 100%;
  min-height: 100%;
  overflow-y: auto;
}
</style>
