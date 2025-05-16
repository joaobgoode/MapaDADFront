import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Map from '../components/Map.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/map', name: 'Map', component: Map },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
