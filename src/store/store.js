import { reactive, ref } from 'vue'
//useStore() vuex
//pinia
import api from '../services/api.js'

export const store = {
  textareaMap: reactive({}),

  editingText: ref(''),

  currentSpace: ref(''),

  pickerDate: ref(new Date()),

  appliedDate: ref(new Date()),

  debug() {
    console.log('=== ESTADO ATUAL DA STORE ===')
    console.log('textareaMap:', this.textareaMap)
    console.log('editingText:', this.editingText.value)

    let selectedCount = 0
    for (const key in this.textareaMap) {
      if (this.textareaMap[key].selected) {
        selectedCount++
        console.log(`Textarea selecionado [${key}]:`, this.textareaMap[key])
      }
    }
    console.log('Total de textareas selecionados:', selectedCount)
    console.log('============================')
  },

  createKey(space, day, time) {
    const dateString = day instanceof Date ? day.toISOString().split('T')[0] : day
    return `${space}-${dateString}-${time}`
  },

  registerTextarea(space, day, time, textareaState) {
    const key = this.createKey(space, day, time)
    //console.log(`Registrando textarea com chave [${key}]`)

    if (!this.textareaMap[key]) {
      this.textareaMap[key] = textareaState
    } else {
      const current = this.textareaMap[key]


      Object.assign(textareaState, {
        editing: current.editing,
        selected: current.selected,
      });


      this.textareaMap[key] = textareaState
    }

    return this.textareaMap[key]
  },

  isRegistered(space, day, time) {
    const key = this.createKey(space, day, time)
    return !!this.textareaMap[key]
  },

  getRegisteredTextArea(space, day, time) {
    const key = this.createKey(space, day, time)
    return this.textareaMap[key] || null
  },

  unregisterTextarea(space, day, time) {
    const key = this.createKey(space, day, time)
    if (this.textareaMap[key]) {
      delete this.textareaMap[key]
    }
  },

  getSelectedTextareas() {
    const selected = []

    for (const key in this.textareaMap) {
      if (this.textareaMap[key].selected) {
        selected.push(this.textareaMap[key])
      }
    }

    return selected
  },

  applyTextToSelected(text) {
    const toChange = []

    for (const key in this.textareaMap) {
      const textarea = this.textareaMap[key]
      if (textarea.selected) {
        textarea.text = text
        toChange.push({
          date: textarea.date,
          hour: textarea.hour,
          space: textarea.space,
          client: text,
        })
      }
    }

    this.unselectAll()
    this.sendToServer(toChange)
  },

  exitEditModeAll() {
    for (const key in this.textareaMap) {
      this.textareaMap[key].editing = false
    }
  },

  sendToServer(textareas) {
    const url = '/api/horarios'
    api.put(url, textareas)
      .then(response => {
        console.log('Dados enviados com sucesso:', response.data)
      })
      .catch(error => {
        console.error('Erro ao enviar dados:', error)
      });
  },

  unselectAll() {
    for (const key in this.textareaMap) {
      this.textareaMap[key].selected = false
    }
  },

  selectTextarea(space, day, time, select = true) {
    const key = this.createKey(space, day, time)
    if (this.textareaMap[key]) {
      this.textareaMap[key].selected = select
    }
  },

  setEditingMode(space, day, time, editing = true) {
    const key = this.createKey(space, day, time)
    if (this.textareaMap[key]) {
      this.textareaMap[key].editing = editing
      if (editing) {
        this.editingText.value = this.textareaMap[key].text
      }
    }
  },
  reset() {
    for (const key in this.textareaMap) {
      delete this.textareaMap[key]
    }

    this.editingText.value = ''

    this.currentSpace.value = ''
  }
}
