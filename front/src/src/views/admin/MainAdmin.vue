<template>
  <div class="main-admin row container" v-if="USER_POWERS === 'admin'">
    <div class="main-admin__menu col-md-6 col-sm-12">
      <h1>Администрирование сайта</h1>
      <h2>Меню:</h2>
      <nav>
        <router-link class="menuNavItem" name="users" to="/users">Пользователи({{ COUNT.all_users }})</router-link>
        <router-link class="menuNavItem" name="tasks" to="/tasks">Задачи({{ COUNT.all_tasks }})</router-link>
      </nav>
    </div>
    <div class="main-admin__logs col-md-6 col-sm-12">
      <div class="main-admin__logs-header">
        <h2>Последние действия:</h2>
        <router-link class="menuNavItem" name="logs" to="/logs">Открыть все</router-link>
      </div>

      <div class="main-admin__logs-content">
        <div class="no-logs" v-if="ADMIN_LOGS.length === 0">Пока ничего нет</div>
        <div class="actions" v-else>
          <div
              class="action"
              v-for="log in ADMIN_LOGS"
              :key="log.id"
          >
            <div class="action__date-time">
              <div class="date">{{ log.date }}</div>
              <div class="time">{{ log.time }}</div>
            </div>
            <div class="action__content">
              <div class="action__header">
                <span class="user">{{ log.admin_name }}</span>
                <span class="user__role"> ({{ log.admin_powers }})</span>
              </div>
              <div class="action__description">
                {{ log.action.message }}:
                {{ log.action.user_name ? log.action.user_name : `№${log.action.task_id}` }}
                {{ log.action.user_addition }}
                {{ log.action.type_log === 'lock' ? (log.action.lock_forever ? '(Навсегда)' : `(до ${log.action.lock_time})`) : '' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'MainAdmin',
  computed: {
    ...mapGetters([
      'USER_POWERS',
      'ADMIN_LOGS',
      'COUNT'
    ])
  },
  methods: {
    ...mapActions([
      'IS_AUTHENTICATED',
      'ADMIN_GET_LOGS',
      'GET_COUNT'
    ])
  },
  async created () {
    await this.IS_AUTHENTICATED()
    if (this.USER_POWERS !== 'admin') window.location.href = '/'
  },
  async mounted () {
    await this.ADMIN_GET_LOGS({ page: 1, onlyLastLogs: true })
    await this.GET_COUNT()
  }
}
</script>

<style scoped lang="scss">
@import 'src/assets/styles/admin/main-admin';
</style>
