<template>
  <div class="main-moderator-and-tasks container" v-if="USER_POWERS === 'admin' || USER_POWERS === 'moderator'">
    <div class="row">
      <div class="col-12">
        <h1>Все задачи({{ COUNT.all_tasks }})</h1>
        <p><router-link to="/moderation" name="moderation">Открыть новые задачи</router-link></p>

        <table>
          <thead>
          <tr>
            <th>Добавлено</th>
            <th>Название</th>
            <th>Автор</th>
            <th>Перепроверок</th>
            <th>Статус</th>
            <th>Сложность</th>
            <th>Классы</th>
            <th>Источник</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="task in ADMIN_TASKS"
              :key="task.id"
              @click="showModalEdit(task)"
          >
            <td>{{ task.create_date }}<br />{{ task.create_time }}</td>
            <td>Задача №{{ task.id }}</td>
            <td>{{ task.real_creator === task.author ? task.author : `${task.author} (${task.real_creator})` }}</td>
            <td>{{ task.number_recheck }}</td>
            <td>{{ task.status }}</td>
            <td>{{ task.difficulty }}</td>
            <td>{{ task.class_level }}</td>
            <td>{{ task.source }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>,
    <ImprovedPaginator
      v-if="page && pages"
      :currentPage="page"
      :countPages="pages"
      @getPage="getPage"
    />
    <transition name="fade">
      <ModalsWrapper
        :type_modal="'edit_task'"
        :edit_task="edit_task_obj"
        v-show="show_modal_edit"
        @close-modal="show_modal_edit = false"
        @complete-edit-task="completeEditTask"
        @delete-task="deleteTask"
        @lock-author="lockAuthor"
      />
    </transition>
  </div>
</template>

<script>
import ImprovedPaginator from '@/components/ImprovedPaginator'
import ModalsWrapper from '@/components/Modals/ModalsWrapper'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Tasks',
  data: () => {
    return {
      pages: false, // потом станет числом
      page: 1,

      show_modal_edit: false,
      edit_task_obj: {}
    }
  },
  components: {
    ImprovedPaginator,
    ModalsWrapper
  },
  computed: {
    ...mapGetters([
      'USER_POWERS',
      'ADMIN_TASKS',
      'COUNT',
      'PAGES_ALL_TASKS'
    ])
  },
  methods: {
    ...mapActions([
      'ADMIN_GET_TASKS',
      'IS_AUTHENTICATED',
      'ADMIN_EDIT_TASK',
      'ADMIN_DELETE_TASK',
      'ADMIN_LOCK_TASK_AUTHOR',
      'GET_COUNT'
    ]),
    async getPage (page) {
      await this.ADMIN_GET_TASKS(page)
      this.page = page
    },
    showModalEdit (task) {
      this.show_modal_edit = true
      this.edit_task_obj = task
    },
    async completeEditTask (task) {
      const isEdit = await this.ADMIN_EDIT_TASK(task)
      if (isEdit) {
        this.show_modal_edit = false
        await this.ADMIN_GET_TASKS(this.page)
        window.myAlert('Задание изменено')
      }
    },
    async deleteTask () {
      const isDelete = await this.ADMIN_DELETE_TASK(this.edit_task_obj.id)
      if (isDelete) {
        this.show_modal_edit = false
        await this.ADMIN_GET_TASKS(this.page)
        window.myAlert('Задание удалено')
      }
    },
    async lockAuthor (timeLock) {
      const data = {
        timeLock,
        userId: this.edit_task_obj.author_id,
        taskId: this.edit_task_obj.id
      }
      const isLock = await this.ADMIN_LOCK_TASK_AUTHOR(data)
      if (isLock) {
        this.show_modal_edit = false
        await this.ADMIN_GET_TASKS(this.page)
        window.myAlert('Пользователь заблокирован, задание удалено.')
      }
    }
  },

  async created () {
    await this.IS_AUTHENTICATED()
    if (this.USER_POWERS !== 'admin' && this.USER_POWERS !== 'moderator') window.location.href = '/'
  },
  async mounted () {
    // Здесь получаю pages
    await this.ADMIN_GET_TASKS(this.page)
    await this.GET_COUNT()
    this.pages = this.PAGES_ALL_TASKS
  }
}
</script>

<style lang="scss" scoped>
@import "src/assets/styles/admin/main-moderator-and-tasks";
</style>
