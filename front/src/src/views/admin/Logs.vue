<template>
  <div class="logs container" v-if="USER_POWERS === 'admin'">
    <div class="row">
      <div class="col-12">
        <h1>Последние действия:</h1>
        <div class="logs__content">
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

        <ImprovedPaginator
          v-if="page && pages"
          :currentPage="page"
          :countPages="pages"
          @getPage="getPage"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ImprovedPaginator from '@/components/ImprovedPaginator'

export default {
  name: 'Logs',
  data: () => {
    return {
      pages: false, // потом станет числом
      page: 1
    }
  },
  components: {
    ImprovedPaginator
  },
  computed: {
    ...mapGetters([
      'USER_POWERS',
      'ADMIN_LOGS',
      'PAGES_LOGS'
    ])
  },
  methods: {
    ...mapActions([
      'IS_AUTHENTICATED',
      'ADMIN_GET_LOGS'
    ]),
    async getPage (page) {
      await this.ADMIN_GET_LOGS({ page: this.page, onlyLastLogs: false })
      this.page = page
    }
  },
  async created () {
    await this.IS_AUTHENTICATED()
    if (this.USER_POWERS !== 'admin') window.location.href = '/'
  },
  async mounted () {
    await this.ADMIN_GET_LOGS({ page: this.page, onlyLastLogs: false })
    this.pages = this.PAGES_LOGS
  }
}
</script>

<style scoped lang="scss">
@import 'src/assets/styles/admin/logs';
</style>
