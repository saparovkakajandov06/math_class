<template>
  <div class="main-moderator-and-tasks container" v-if="USER_POWERS === 'admin' || USER_POWERS === 'moderator'">
    <div class="row">
      <div class="col-12">
        <h1>Список новых задач({{ COUNT.new_tasks }})</h1>
        <p><router-link to="/tasks" name="tasks">Открыть все задачи</router-link></p>

        <table>
          <thead>
            <tr>
              <th>Добавлено</th>
              <th>Название</th>
              <th>Автор</th>
              <th>Перепроверок</th>
              <th>Сложность</th>
              <th>Классы</th>
              <th>Источник</th>
            </tr>
          </thead>
          <tbody>
          <tr
            v-for="task in ADMIN_TASKS_FOR_CHECK"
            :key="task.id"
            @click="openModerationTask(task)"
          >
            <td>{{ task.modified_date }}<br />{{ task.modified_time }}</td>
            <td>Задача №{{ task.id }}</td>
            <td>{{ task.real_creator === task.author ? task.author : `${task.author} (${task.real_creator})` }}</td>
            <td>{{ task.number_recheck }}</td>
            <td>{{ task.difficulty }}</td>
            <td>{{ task.class_level }}</td>
            <td>{{ task.source }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <ImprovedPaginator
      v-if="page && pages"
      :currentPage="page"
      :countPages="pages"
      @getPage="getPage"
    />
    <transition name="fade">
      <ModalsWrapper
        :type_modal="'task_moderation'"
        :check_task="check_task"
        v-show="show_modal_moderation"
        @close-modal="show_modal_moderation = false"
        @moder-edit-task="moderEditTask"
        @moder-lock-author="moderLockAuthor"
        @moder-delete-task="moderDeleteTask"
        @reject-task="rejectTask"
        @confirm-task="confirmTask"
      />
    </transition>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ImprovedPaginator from '@/components/ImprovedPaginator'
import ModalsWrapper from '@/components/Modals/ModalsWrapper'

export default {
  name: 'MainModerator',
  data: () => {
    return {
      pages: false, // потом станет числом
      page: 1,

      show_modal_moderation: false,
      check_task: {}
    }
  },
  components: {
    ImprovedPaginator,
    ModalsWrapper
  },
  computed: {
    ...mapGetters([
      'USER_POWERS',
      'ADMIN_TASKS_FOR_CHECK',
      'COUNT',
      'PAGES_NEW_TASKS'
    ])
  },
  methods: {
    ...mapActions([
      'IS_AUTHENTICATED',
      'ADMIN_GET_TASKS_FOR_CHECK',
      'ADMIN_LOCK_TASK_AUTHOR',
      'ADMIN_DELETE_TASK',
      'ADMIN_CONFIRM_REJECT_TASK',
      'GET_COUNT'
    ]),
    async getPage (page) {
      await this.ADMIN_GET_TASKS_FOR_CHECK(page)
      this.page = page
    },
    openModerationTask (task) {
      this.check_task = task
      this.show_modal_moderation = true
    },
    moderEditTask () {
      this.ADMIN_GET_TASKS_FOR_CHECK(this.page)
    },
    async moderLockAuthor (timeLock) {
      const data = {
        timeLock,
        userId: this.check_task.author_id,
        taskId: this.check_task.id
      }
      const isLock = await this.ADMIN_LOCK_TASK_AUTHOR(data)
      if (isLock) {
        this.show_modal_moderation = false
        await this.ADMIN_GET_TASKS_FOR_CHECK(this.page)
        window.myAlert('Пользователь заблокирован, задание удалено.')
      }
    },
    async moderDeleteTask () {
      const isDelete = await this.ADMIN_DELETE_TASK(this.check_task.id)
      if (isDelete) {
        this.show_modal_moderation = false
        await this.ADMIN_GET_TASKS_FOR_CHECK(this.page)
        window.myAlert('Задание удалено')
      }
    },
    async confirmTask (moderComment) {
      const data = {
        taskId: this.check_task.id,
        typeAction: 'confirm',
        moderComment
      }
      const isDo = await this.ADMIN_CONFIRM_REJECT_TASK(data)
      if (isDo) {
        await this.ADMIN_GET_TASKS_FOR_CHECK(this.page)
        this.show_modal_moderation = false
        window.myAlert('Задача одобрена.')
      }
    },
    async rejectTask (moderComment) {
      const data = {
        taskId: this.check_task.id,
        typeAction: 'reject',
        moderComment
      }
      const isDo = await this.ADMIN_CONFIRM_REJECT_TASK(data)
      if (isDo) {
        await this.ADMIN_GET_TASKS_FOR_CHECK(this.page)
        this.show_modal_moderation = false
        window.myAlert('Задача отклонена.')
      }
    }
  },

  async created () {
    await this.IS_AUTHENTICATED()
    if (this.USER_POWERS !== 'admin' && this.USER_POWERS !== 'moderator') window.location.href = '/'
  },
  async mounted () {
    await this.ADMIN_GET_TASKS_FOR_CHECK(this.page)
    await this.GET_COUNT()
    this.pages = this.PAGES_NEW_TASKS
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/styles/admin/main-moderator-and-tasks";
</style>
