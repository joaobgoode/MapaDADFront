<script setup>
import { reactive, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { store } from '../store/store.js'
import { inject, ref } from 'vue'
import axios from 'axios'

//=====    Props   ====//

const props = defineProps({
  initialText: {
    type: String,
    default: ''
  },
  space: String,
  day: Date,
  time: Number,
  initialColor: {
    type: String,
    default: '#FFFFFF'
  }
})

//=====    State Variables   ====//

const getKey = () => store.createKey(props.space, props.day, props.time)
const paintMode = inject('paintMode')
const selectedColor = inject('selectedColor')
const color = ref(props.initialColor)

const textareaState = reactive({
  text: props.initialText,
  date: props.day.toISOString().split('T')[0],
  hour: props.time,
  space: props.space,
  color: color,
  selected: false,
  editing: false
})

const editingText = computed({
  get: () => store.editingText.value,
  set: (val) => { store.editingText.value = val }
})

//=====    Mount / UnMount   ====//

onMounted(() => {

  store.registerTextarea(props.space, props.day, props.time, textareaState)

})

onBeforeUnmount(() => {
  if (!textareaState.selected) {
    store.unregisterTextarea(props.space, props.day, props.time)
  }
})


//====    State Management   ====//


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

function saveChanges() {
  if (textareaState.editing) {

    const newText = editingText.value

    store.applyTextToSelected(newText)

    store.setEditingMode(props.space, props.day, props.time, false)

    store.unselectAll()

  }
}

async function saveColor() {
  const path = "http://localhost:3000/api/horarios/color"
  const requestBody = {
    date: textareaState.date,
    hour: textareaState.hour,
    space: textareaState.space,
    color: color.value
  }
  const response = await axios.put(path, requestBody)
  if (response.status === 200) {
    console.log("Color saved successfully")
  } else {
    console.error("Failed to save color", response)
  }
}


//=====    Funcionalities   ====//

//=====    Click   ====//

function handleClick() {

  if (paintMode.value) {
    if (color.value === selectedColor.value) {
      return
    }
    color.value = selectedColor.value
    saveColor()
    return
  }

  const someoneEditing = Object.values(store.textareaMap).some(ta => ta.editing)

  if (someoneEditing) {
    return
  }


  const newSelected = !textareaState.selected

  if (!event.ctrlKey) {
    store.unselectAll()
  }

  store.selectTextarea(props.space, props.day, props.time, newSelected)

}


//=====    Double Click   ====//

function handleDoubleClick() {

  if (paintMode.value) {
    return
  }

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

//=====      Edit     ====//

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

  <div class="textarea-wrapper" :class="{
    editing: textareaState.editing,
    selectedOnly: !textareaState.editing && textareaState.selected
  }" :style="{ backgroundColor: color }" @click="handleClick" @dblclick="handleDoubleClick">

    <div v-if="!textareaState.editing" class="textarea-content">
      {{ textareaState.text }}
    </div>
    <textarea v-else v-model="editingText" @blur="saveChanges" @keydown="handleKeyDown" class="textarea-edit"
      :class="{ selected: textareaState.selected, editing: textareaState.editing }" placeholder="Enter text here"
      autofocus></textarea>
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
  max-height: calc(0.5em * 2 + 20px);
  color: black;
  width: 100%;
  text-align: center;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}

.textarea-wrapper:hover {
  border: 2px solid #3253fa;
}

.textarea-wrapper.editing {
  border: 1px solid green;
  box-shadow: 0 0 5px green;
}

.textarea-wrapper.selectedOnly {
  border: 3px solid #1736ff;
  box-shadow: 0 0 5px #1736ff;
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
  font-weight: bold;
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
