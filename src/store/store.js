import { reactive, ref } from 'vue'
import axios from 'axios';

export const store = {
  textareaMap: reactive({}),

  editingText: ref(''),

  currentSpace: ref(''),
  currentSlot1: ref(new Date()),
  currentSlot2: ref(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)),
  currentSlot3: ref(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
  currentSlot4: ref(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
  currentSlot5: ref(new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)),
  currentSlot6: ref(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
  currentSlot7: ref(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)),

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
    console.log(`Registrando textarea com chave [${key}]`)

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

    console.log('Aplicando texto a todos os selecionados:', text)

    const selectedTextareas = this.getSelectedTextareas()
    console.log('Quantidade de textareas selecionados:', selectedTextareas.length)

    for (const key in this.textareaMap) {
      const textarea = this.textareaMap[key]
      if (textarea.selected) {
        console.log(`Atualizando textarea [${key}]`)
        textarea.text = text
        toChange.push({
          date: textarea.date,
          hour: textarea.hour,
          space: textarea.space,
          client: text,
        })
      }
    }
    this.sendToServer(toChange)
  },

  exitEditModeAll() {
    for (const key in this.textareaMap) {
      this.textareaMap[key].editing = false
    }
  },

  sendToServer(textareas) {
    const url = 'http://localhost:3000/api/horarios'
    axios.put(url, textareas)
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

    const now = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      this[`currentSlot${i + 1}`].value = date
    }
  }
}
