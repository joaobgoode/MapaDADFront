import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VDatePicker from 'v-calendar'
import 'v-calendar/style.css';

const app = createApp(App)
app.use(VDatePicker, {})
app.use(router).mount('#app')
