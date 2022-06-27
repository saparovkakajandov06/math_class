import VueRouter from 'vue-router'
import Vue from 'vue'

import MainAdmin from '@/views/admin/MainAdmin'
import Logs from '@/views/admin/Logs'
import MainModerator from '@/views/admin/MainModerator'
import Users from '@/views/admin/Users'
import Tasks from '@/views/admin/Tasks'

import Catalog from '@/views/Catalog'
import Favorites from '@/views/Favorites'

import My404 from '@/views/service/My404'
import AuthRegConfirm from '@/views/service/AuthRegConfirm'
import ChangePasswordConfirm from '@/views/service/ChangePasswordConfirm'
import MyTasks from '@/views/MyTasks'

Vue.use(VueRouter)

const routesMain = [
  {
    path: '/',
    component: Catalog
  },
  {
    path: '/favorites',
    component: Favorites
  },
  {
    path: '/my_tasks',
    component: MyTasks
  }
]
const routesAdmin = [
  {
    path: '/admin',
    component: MainAdmin
  },
  {
    path: '/logs',
    component: Logs
  },
  {
    path: '/users',
    component: Users
  },
  {
    path: '/tasks',
    component: Tasks
  },
  {
    path: '/moderation',
    component: MainModerator
  }
]
const routesService = [
  {
    path: '/auth_forget_confirm',
    component: ChangePasswordConfirm
  },
  {
    path: '/auth_reg_confirm',
    component: AuthRegConfirm
  },
  {
    path: '/page-not-found',
    alias: '*',
    component: My404
  }
]

const routes = [
  ...routesMain,
  ...routesAdmin,
  ...routesService
]

export const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
