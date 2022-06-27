import axios from 'axios'

const domain = 'http://127.0.0.1:8000'

export default {
  IS_AUTHENTICATED ({ commit }) {
    return axios.post(`${domain}/api/is_authenticated_user`)
      .then((response) => {
        commit('SET_IS_AUTHENTICATED', response.data)
        return !!response.data.status
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
  }
}
