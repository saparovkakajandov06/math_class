export default {
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
