import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import VueCookies from 'vue-cookies'

Vue.use(Vuex)
Vue.use(VueCookies)

// set default config
Vue.$cookies.config('30d')

const domain = 'http://127.0.0.1:8000'

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.withCredentials = true

export default new Vuex.Store({
  state: {
    roles: [],
    authors: [],

    tasks: [],
    admin_tasks_for_check: [],
    favorite_tasks: [],

    user_is_authenticated: false,
    user_fio: '',
    user_powers: '',

    admin_users: [],
    admin_tasks: [],

    logs: [],
    count: {},

    pages_all_tasks: 0,
    pages_new_tasks: 0,
    pages_users: 0,
    pages_logs: 0
  },
  mutations: {
    SET_IS_AUTHENTICATED: (state, data) => {
      state.user_fio = data.fio
      state.user_powers = data.powers
      state.user_is_authenticated = data.status
    },

    SET_ROLES_TO_STATE: (state, roles) => {
      state.roles = roles
    },
    SET_AUTHORS_TO_STATE: (state, authors) => {
      state.authors = authors
    },
    SET_COUNT: (state, data) => {
      state.count = data
    },

    SET_TASKS: (state, tasks) => {
      state.tasks = tasks
    },
    SET_ADMIN_TASKS_FOR_CHECK: (state, tasks) => {
      state.admin_tasks_for_check = tasks
    },
    SET_USER_FAVORITE_TASKS: (state, tasks) => {
      state.favorite_tasks = tasks
    },

    SET_ADMIN_USERS: (state, users) => {
      state.admin_users = users
    },
    SET_ADMIN_TASKS: (state, tasks) => {
      state.admin_tasks = tasks
    },
    SET_ADMIN_LOGS: (state, logs) => {
      state.logs = logs
    },

    SET_PAGES_ALL_TASKS: (state, pages) => {
      state.pages_all_tasks = pages
    },
    SET_PAGES_NEW_TASKS: (state, pages) => {
      state.pages_new_tasks = pages
    },
    SET_PAGES_LOGS: (state, pages) => {
      state.pages_logs = pages
    },
    SET_PAGES_USERS: (state, pages) => {
      state.pages_users = pages
    }
  },
  actions: {
    // GET_CSRF_TOKEN ({ commit }) {
    //   return axios.post(`${domain}/api/get_csrf_token`)
    //     .then((response) => {
    //       // Vue.$cookies.set('csrftoken', response.data.token)
    //     })
    //     .catch((error) => {
    //       window.myAlert(error.message)
    //     })
    // },
    IS_AUTHENTICATED ({ commit }) {
      return axios.post(`${domain}/api/is_authenticated_user`)
        .then((response) => {
          commit('SET_IS_AUTHENTICATED', response.data)
          return true
        })
        .catch((error) => {
          window.myAlert(error.message)
          return false
        })
    },
    FORGET_PASSWORD ({ commit }, login) {
      return axios.post(`${domain}/api/auth_forget`, {
        login
      })
        .then((response) => {
          if (response.data.success === 'true') {
            window.myAlert(response.data.message)
          } else {
            window.myAlert(response.data.error)
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
        })
    },
    LOGIN ({ commit }, { login, pw }) {
      return axios.post(`${domain}/api/auth_login`, {
        login,
        pw
      })
        .then((response) => {
          if (response.data.success === 'true') {
            window.location.reload()
          } else {
            window.myAlert(response.data.error)
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
        })
    },
    REGISTRATION ({ commit }, { fio, login, roleId, pw }) {
      return axios.post(`${domain}/api/auth_reg`, {
        fio,
        login,
        roleId,
        pw
      })
        .then((response) => {
          if (response.data.success === 'true') {
            window.myAlert(response.data.message)
          } else {
            window.myAlert(response.data.error)
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
        })
    },
    LOGOUT ({ commit }) {
      return axios.get(`${domain}/api/auth_logout`)
        .then((response) => {
          window.location.reload()
        })
        .catch((error) => {
          window.myAlert(error.message)
        })
    },

    GET_ROLES ({ commit }) {
      return axios.post(`${domain}/api/get_authors_sources_roles`, {
        type_data: 'roles'
      })
        .then((response) => {
          commit('SET_ROLES_TO_STATE', response.data.data)
          return response.data
        })
        .catch((error) => {
          window.myAlert(error.message)
        })
    },
    GET_AUTHORS ({ commit }) {
      return axios.post(`${domain}/api/get_authors_sources_roles`, {
        type_data: 'authors'
      })
        .then((response) => {
          commit('SET_AUTHORS_TO_STATE', response.data.data)
          return true
        })
        .catch((error) => {
          window.myAlert(error.message)
          return false
        })
    },
    GET_COUNT ({ commit }) {
      return axios.post(`${domain}/api/get_count_users_tasks`)
        .then((response) => {
          if (response.data.status === 'success') {
            commit('SET_COUNT', response.data.data)
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
        })
    },

    GET_TASKS ({ commit }, { url, page }) {
      return axios.get(`${domain}${url}`)
        .then((response) => {
          if (response.data.success === 'true') {
            const tasks = response.data.tasks

            for (let i = 0; i < tasks.length; i++) {
              tasks[i].favorite = false
              for (let j = 0; j < this.state.favorite_tasks.length; j++) {
                if (this.state.favorite_tasks[j].id === tasks[i].id) {
                  tasks[i].favorite = true
                  break
                }
              }
            }
            const pages = []
            const showPages = []
            for (let i = 1; i < response.data.maxPage; i++) {
              pages.push(i)
              if ((i > page - 3 || i > response.data.maxPage - 4 * 2) && (i < page + 5 || i < 4 * 2)) { showPages.push(i) }
            }
            console.log(response.data)
            commit('SET_TASKS', tasks)
            return {
              pages,
              showPages
            }
          } else {
            window.myAlert(response.data.error)
            return false
          }
        })
        .catch((error) => {
          window.myAlert(error)
          return false
        })
    },
    GET_USER_FAVORITE_TASKS ({ commit }) {
      return axios.post(`${domain}/api/get_favorite_tasks`)
        .then((response) => {
          if (response.data.success === 'true') {
            commit('SET_USER_FAVORITE_TASKS', response.data.tasks)
            return true
          } else {
            window.myAlert(response.data.error)
            return false
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
          return false
        })
    },
    TOGGLE_FAVORITE_TASK ({ commit }, task) {
      let url = 'add_favorite_task'
      if (task.favorite) url = 'delete_task_from_favorite'

      return axios.post(`${domain}/api/${url}`, {
        taskId: task.id
      })
        .then((response) => {
          if (this.state.user_is_authenticated) {
            if (response.data.success === 'true') {
              return { taskId: response.data.task_id }
            } else {
              window.myAlert(response.data.error)
              return false
            }
          } else {
            // Да-да, jquery, но чтобы переписывать это такой геморой...
            window.$('#auth').modal('show')
            return false
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
          return false
        })
    },

    ADMIN_GET_USERS ({ commit }) {
      return axios.post(`${domain}/api/admin/get_users`)
        .then((response) => {
          if (response.data.status === 'success') {
            commit('SET_ADMIN_USERS', response.data.data)
            return true
          } else {
            // Юзер не является админом, перекидываем его на главную страницу
            window.location.href = '/'
            return false
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
          return false
        })
    },
    ADMIN_ADD_USER ({ commit }, user) {
      return axios.post(`${domain}/api/admin/add_user`, { user })
        .then((response) => {
          if (response.data.status === 'success') {
            return true
          } else {
            window.myAlert(response.data.error)
            return false
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
          return false
        })
    },
    ADMIN_EDIT_USER ({ commit }, user) {
      return axios.post(`${domain}/api/admin/edit_user`, { user })
        .then((response) => {
          if (response.data.status === 'success') {
            window.myAlert('Данные пользователя изменены')
            return true
          } else {
            window.myAlert(response.data.message)
            return false
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
          return false
        })
    },
    ADMIN_DELETE_USERS ({ commit }, users) {
      return axios.post(`${domain}/api/admin/delete_users`, { users })
        .then((response) => {
          return response.data.status === 'success'
        })
        .catch((error) => {
          window.myAlert(error.message)
          return false
        })
    },

    ADMIN_GET_TASKS ({ commit }, page) {
      return axios.post(`${domain}/api/admin/get_tasks`, { page })
        .then((response) => {
          if (response.data.status === 'success') {
            commit('SET_ADMIN_TASKS', response.data.tasks)
            commit('SET_PAGES_ALL_TASKS', response.data.count_pages)
          } else {
            window.location.href = '/'
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
        })
    },
    ADMIN_GET_TASKS_FOR_CHECK ({ commit }, page) {
      return axios.post(`${domain}/api/admin/tasks_for_check`, { page })
        .then((response) => {
          if (response.data.status === 'success') {
            commit('SET_ADMIN_TASKS_FOR_CHECK', response.data.tasks)
            commit('SET_PAGES_NEW_TASKS', response.data.count_pages)
          } else {
            window.myAlert('Ошибка...')
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
        })
    },
    ADMIN_EDIT_TASK ({ commit }, task) {
      return axios.post(`${domain}/api/admin/edit_task`, {
        task
      })
        .then((response) => {
          if (response.data.status === 'success') {
            return true
          } else {
            window.myAlert('Ошибка')
            return false
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
          return false
        })
    },
    ADMIN_DELETE_TASK ({ commit }, taskId) {
      return axios.post(`${domain}/api/admin/delete_task`, {
        taskId
      })
        .then((response) => {
          if (response.data.status === 'success') {
            return true
          } else {
            window.myAlert('Ошибка')
            return false
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
          return false
        })
    },
    ADMIN_LOCK_TASK_AUTHOR ({ commit }, { userId, taskId, timeLock }) {
      return axios.post(`${domain}/api/admin/lock_author_task`, {
        userId, taskId, timeLock
      })
        .then((response) => {
          if (response.data.status === 'success') {
            return true
          } else {
            window.myAlert('Ошибка')
            return false
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
          return false
        })
    },
    ADMIN_CONFIRM_REJECT_TASK ({ commit }, { taskId, typeAction, moderComment }) {
      return axios.post(`${domain}/api/admin/confirm_reject_task`, {
        taskId,
        typeAction,
        moderComment
      })
        .then((response) => {
          if (response.data.status === 'success') {
            return true
          } else {
            window.myAlert('Произошла непонятная ошибка... Перезагрузите страницу и попробуйте ещё раз.')
            return false
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
          return false
        })
    },

    ADMIN_GET_LOGS ({ commit }, { page, onlyLastLogs }) {
      return axios.post(`${domain}/api/admin/get_logs`, {
        page,
        onlyLastLogs
      })
        .then((response) => {
          if (response.data.status === 'success') {
            commit('SET_ADMIN_LOGS', response.data.logs)
            if (response.data.count_pages !== null) {
              commit('SET_PAGES_LOGS', response.data.count_pages)
            }
          } else {
            window.myAlert('Ошибка...')
          }
        })
        .catch((error) => {
          window.myAlert(error.message)
        })
    }
  },
  getters: {
    USER_FIO (state) {
      return state.user_fio
    },
    USER_POWERS (state) {
      return state.user_powers
    },
    USER_IS_AUTHENTICATED (state) {
      return state.user_is_authenticated
    },

    ROLES (state) {
      return state.roles
    },
    AUTHORS (state) {
      return state.authors
    },
    COUNT (state) {
      return state.count
    },

    TASKS (state) {
      return state.tasks
    },
    FAVORITE_TASKS (state) {
      return state.favorite_tasks
    },

    ADMIN_USERS (state) {
      return state.admin_users
    },
    ADMIN_TASKS (state) {
      return state.admin_tasks
    },
    ADMIN_TASKS_FOR_CHECK (state) {
      return state.admin_tasks_for_check
    },
    ADMIN_LOGS (state) {
      return state.logs
    },

    PAGES_ALL_TASKS (state) {
      return state.pages_all_tasks
    },
    PAGES_NEW_TASKS (state) {
      return state.pages_new_tasks
    },
    PAGES_LOGS (state) {
      return state.pages_logs
    }
  }
})
