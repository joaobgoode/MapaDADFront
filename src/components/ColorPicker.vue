<template>
  <div class="color-picker-dropdown" ref="colorPickerRef">
    <button class="color-picker-btn" :class="modelValue ? 'bg-primary' : 'bg-white'" @click.stop="toggleColorPicker">
      <div class="color-preview" :style="{ backgroundColor: selectedColor }"></div>
      <i class="bi bi-chevron-down"></i>
    </button>
    <div class="color-options" v-if="showColorPicker" @click.stop>
      <div v-for="(color, name) in colorOptions" :key="name" class="color-option" :style="{ backgroundColor: color }"
        @click.stop="selectColor(color, name)" :title="name">
      </div>
      <div class="color-option exit-option" @click.stop="exitPaintMode" title="Sair do modo pintura">
        <i class="bi bi-x-circle"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialColor: {
    type: String,
    default: '#FFFFFF'
  }
});

const emit = defineEmits(['update:modelValue', 'update:selectedColor', 'update:selectedColorName']);

const showColorPicker = ref(false);
const selectedColor = ref(props.initialColor);
const selectedColorName = ref('Branco');
const colorPickerRef = ref(null);

const colorOptions = {
  'Branco': '#FFFFFF',
  'Verde': '#4CAF50',
  'Vermelho': '#F44336',
  'Azul': '#2196F3',
  'Amarelo': '#FFEB3B',
  'Roxo': '#9C27B0',
  'Cyan': '#00BCD4',
  'Magenta': '#E91E63'
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

function handleClickOutside(event) {
  if (colorPickerRef.value && !colorPickerRef.value.contains(event.target)) {
    showColorPicker.value = false;
  }
}

function toggleColorPicker(event) {
  event.stopPropagation();
  showColorPicker.value = !showColorPicker.value;
}

function selectColor(color, name) {
  selectedColor.value = color;
  selectedColorName.value = name;
  emit('update:selectedColor', color);
  emit('update:selectedColorName', name);
  emit('update:modelValue', true);
  showColorPicker.value = false;
}

function exitPaintMode() {
  emit('update:modelValue', false);
  showColorPicker.value = false;
}
</script>

<style scoped>
.color-picker-dropdown {
  position: absolute;
  z-index: 1001;
}

.color-picker-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.color-picker-btn:hover {
  background-color: #e0e0e0;
}

.color-preview {
  width: 24px;
  height: 24px;
  border: 1px solid #aaa;
  border-radius: 3px;
}

.color-options {
  position: absolute;
  top: 100%;
  left: 0;
  width: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 8px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1002;
}

.color-option {
  width: 30px;
  height: 30px;
  cursor: pointer;
  border-radius: 50%;
  border: 1px solid #ddd;
}

.color-option:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.exit-option {
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  grid-column: span 4;
  width: 100%;
  height: 30px;
  border-radius: 15px;
  margin-top: 4px;
  border-top: 1px solid #eee;
  padding-top: 4px;
}
</style>
