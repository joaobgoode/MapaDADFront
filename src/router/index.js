import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Map from '../components/Map.vue'
import AdminView from '../components/Admin/AdminView.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/admin', name: 'Admin', component: AdminView, meta: { requiresAuth: true, fistLoginCheck: true } },
  { path: '/map', name: 'Map', component: Map, meta: { requiresAuth: true, firstLoginCheck: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const needsAuth = to.matched.some(record => record.meta.requiresAuth)
  const firstLoginCheck = to.matched.some(record => record.meta.firstLoginCheck)
  if (needsAuth) {
    const isAuthenticated = checkIfUserIsAuthenticated()

    if (!isAuthenticated) {
      next({ name: 'Home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

function checkIfUserIsAuthenticated() {
  const token = localStorage.getItem('token')
  return !!token
}

export default router
