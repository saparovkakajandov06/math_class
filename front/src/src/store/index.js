import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import VueCookies from 'vue-cookies'

import AuthenticatedActions from '@/store/authenticated/actions'
import AuthenticatedMutations from '@/store/authenticated/mutations'
import AuthenticatedGetters from '@/store/authenticated/getters'
import AuthenticatedStates from '@/store/authenticated/states'

import AdminActions from '@/store/admin/actions'
import AdminMutations from '@/store/admin/mutations'
import AdminGetters from '@/store/admin/getters'
import AdminStates from '@/store/admin/states'

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
    ...AuthenticatedStates,
    ...AdminStates,
    roles: [],
    authors: [],

    tasks: [],
    favorite_tasks: []
  },
  mutations: {
    ...AuthenticatedMutations,
    ...AdminMutations,
    SET_ROLES_TO_STATE: (state, roles) => {
      state.roles = roles
    },
    SET_AUTHORS_TO_STATE: (state, authors) => {
      state.authors = authors
    },

    SET_TASKS: (state, tasks) => {
      state.tasks = tasks
    },
    SET_USER_FAVORITE_TASKS: (state, tasks) => {
      state.favorite_tasks = tasks
    }
  },
  actions: {
    ...AuthenticatedActions,
    ...AdminActions,
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
    }
  },
  getters: {
    ...AuthenticatedGetters,
    ...AdminGetters,
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
    }
  }
})
