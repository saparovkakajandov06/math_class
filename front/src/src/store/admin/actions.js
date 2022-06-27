import axios from 'axios'

const domain = 'http://127.0.0.1:8000'

export default {
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
}
