export default {
  SET_COUNT: (state, data) => {
    state.count = data
  },
  SET_ADMIN_TASKS_FOR_CHECK: (state, tasks) => {
    state.admin_tasks_for_check = tasks
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
}
