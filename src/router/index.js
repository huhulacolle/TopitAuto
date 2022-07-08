import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Update from '@/views/Update.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/update',
    name: 'update',
    component: Update
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
