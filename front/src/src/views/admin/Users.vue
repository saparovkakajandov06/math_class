<template>
  <div class="main-users container" v-if="USER_POWERS === 'admin'">
    <div class="row">
      <div class="main-users__menu col-3">
        <p>Выберите группу пользователей:</p>
        <ul>
          <li
            :class="current_filter === 'all' ? 'current_filter' : ''"
            @click="current_filter = 'all'"
          >Все пользователи({{ COUNT.all_users }})</li>
          <li
            :class="current_filter === 'admins' ? 'current_filter' : ''"
            @click="current_filter = 'admins'"
          >Администраторы({{ COUNT.admins }})</li>
          <li
            :class="current_filter === 'moderators' ? 'current_filter' : ''"
            @click="current_filter = 'moderators'"
          >Модераторы({{ COUNT.moderators }})</li>
          <li
            :class="current_filter === 'teachers' ? 'current_filter' : ''"
            @click="current_filter = 'teachers'"
          >Преподаватели({{ COUNT.teachers }})</li>
          <li
            :class="current_filter === 'pupils' ? 'current_filter' : ''"
            @click="current_filter = 'pupils'"
          >Ученики({{ COUNT.students }})</li>
        </ul>
        <div class="add-user">
          <button
              type="button"
              class="btn btn-info"
              @click="show_modal_add_user = true"
          >Добавить пользователя</button>
        </div>
      </div>
      <div class="main-users__content col-9">
        <div class="main-users__content-header">
          <div class="search">
            <input type="text" placeholder="Поиск по ФИО..." v-model="search_field">
            <div class="btn-group">
              <button class="btn btn-dark btn-sm" @click="searchUsers">Найти</button>
              <button v-if="active_search" class="btn btn-warning btn-sm" @click="cancelSearch">Отменить</button>
            </div>
          </div>
          <div class="delete-items">
            <button type="button" class="btn btn-danger" @click="deleteUsers">Удалить</button>
          </div>
        </div>

        <table>
          <thead>
          <tr>
            <th>Выбрать</th>
            <th>ФИО</th>
            <th>Роль</th>
            <th>Доп. Полномочия</th>
            <th>Дата Регистрации</th>
            <th>Бан</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="user in filter_tasks"
            :key="user.id"
            @click="showModalEditUser(user)">
            <td>
              <div class="custom-control custom-checkbox" @click.stop>
                <input type="checkbox" class="custom-control-input" :id="'checkUser-' + user.id" @click="checkUser(user.id)">
                <label class="custom-control-label" :for="'checkUser-' + user.id"></label>
              </div>
            </td>
            <td>{{ user.fio }}</td>
            <td>{{ user.role_str }}</td>
            <td>{{ user.powers_str }}</td>
            <td>{{ user.date_reg }}</td>
            <td>{{ user.lock ? (user.lock_forever ? 'Навсегда' : `До ${user.lock_time}`) : 'Нет' }}</td>
          </tr>
          </tbody>
        </table>
<!--        <Pagination :pages="pages"-->
<!--                    :show_pages="show_pages"-->
<!--                    :request_page="page+1"-->
<!--        />-->
      </div>
    </div>
    <transition name="fade">
      <ModalsWrapper
        :type_modal="'add_user'"
        v-show="show_modal_add_user"
        @close-modal="show_modal_add_user = false"
        @add-user-complete="addNewUserComplete"
      />
    </transition>
    <transition name="fade">
      <ModalsWrapper
        :type_modal="'edit_user'"
        :user="edit_user"
        v-show="show_modal_edit_user"
        @close-modal="show_modal_edit_user = false"
        @delete-user="deleteUser"
        @edit-user="editUser"
      />
    </transition>
    <transition name="fade">
      <ModalsWrapper
        :type_modal="'confirm_delete_users'"
        :checked_users="checkedUsers"
        v-show="show_modal_delete_users"
        @close-modal="show_modal_delete_users = false"
        @confirm-delete="confirmDeleteUsers"
        @cancel-delete="cancelDeleteUsers"
      />
    </transition>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ModalsWrapper from '@/components/Modals/ModalsWrapper'
// import Pagination from '@/components/Pagination'

export default {
  name: 'Users',
  data: () => {
    return {
      // pages: [1, 2, 3, 4, 5, 6],
      // show_pages: [1, 2, 3, 4],
      // page: 1,

      show_modal_add_user: false,
      show_modal_edit_user: false,
      show_modal_delete_users: false,

      edit_user: {},
      checkedUsers: [],

      filter_tasks: [],
      current_filter: 'all',

      search_field: '',
      active_search: false
    }
  },
  components: {
    // Pagination,
    ModalsWrapper
  },
  computed: {
    ...mapGetters([
      'ADMIN_USERS',
      'USER_POWERS',
      'COUNT'
    ])
  },
  methods: {
    ...mapActions([
      'ADMIN_GET_USERS',
      'ADMIN_DELETE_USERS',
      'ADMIN_EDIT_USER',
      'IS_AUTHENTICATED',
      'GET_COUNT'
    ]),
    showModalEditUser (user) {
      this.show_modal_edit_user = true
      this.edit_user = user
    },
    async addNewUserComplete () {
      // Заново получаем список юзеров(чтобы только что созданный добавился в него)
      const isGet = await this.ADMIN_GET_USERS()
      if (isGet) this.filter_tasks = this.ADMIN_USERS

      this.show_modal_add_user = false
      window.myAlert('Пользователь добавлен!')
    },
    checkUser (userId) {
      const inputElement = document.getElementById(`checkUser-${userId}`)
      let checkUser = {}
      for (const user of this.ADMIN_USERS) {
        // eslint-disable-next-line no-unused-expressions
        user.id === userId ? checkUser = user : undefined
      }
      if (inputElement.checked) {
        this.checkedUsers.push(checkUser)
      } else {
        const index = this.checkedUsers.indexOf(checkUser)
        if (index !== -1) {
          this.checkedUsers.splice(index, 1)
        }
      }
    },

    deleteUsers () {
      if (this.checkedUsers.length === 0) return undefined
      this.show_modal_delete_users = true
    },
    async confirmDeleteUsers () {
      const idCheckedUsers = []
      for (const user of this.checkedUsers) {
        idCheckedUsers.push(user.id)
      }
      const isDelete = await this.ADMIN_DELETE_USERS(idCheckedUsers)
      if (isDelete) {
        this.show_modal_delete_users = false
        window.myAlert('Пользователи удалены!')

        // Обновляем список юзеров
        const isGet = await this.ADMIN_GET_USERS()
        if (isGet) this.filter_tasks = this.ADMIN_USERS

        this.show_modal_edit_user = false
        this.current_filter = 'all'
      }
    },
    cancelDeleteUsers () {
      this.show_modal_delete_users = false
    },

    deleteUser () {
      this.checkedUsers = [this.edit_user]
      this.show_modal_delete_users = true
    },

    searchUsers () {
      const findUsers = []
      for (const user of this.filter_tasks) {
        if (user.fio.startsWith(this.search_field.trim())) {
          findUsers.push(user)
        }
      }
      this.active_search = true
      this.filter_tasks = findUsers
    },
    cancelSearch () {
      this.filter_tasks = this.ADMIN_USERS
      this.search_field = ''
      this.active_search = false
    },

    async editUser (user) {
      const isEdit = await this.ADMIN_EDIT_USER(user)

      if (isEdit) this.show_modal_edit_user = false

      const isGet = await this.ADMIN_GET_USERS()
      if (isGet) this.filter_tasks = this.ADMIN_USERS
      this.current_filter = 'all'
    }
  },
  watch: {
    current_filter: async function (newValue) {
      if (newValue === 'all') {
        this.filter_tasks = this.ADMIN_USERS
        return undefined
      }

      this.filter_tasks = []
      switch (newValue) {
        case 'admins':
          for (const user of this.ADMIN_USERS) {
            if (user.powers_key === 'admin') {
              this.filter_tasks.push(user)
            }
          }
          break
        case 'moderators':
          for (const user of this.ADMIN_USERS) {
            if (user.powers_key === 'moderator') {
              this.filter_tasks.push(user)
            }
          }
          break
        case 'teachers':
          for (const user of this.ADMIN_USERS) {
            if (user.role_key === 2 && user.powers_key === 'no') {
              this.filter_tasks.push(user)
            }
          }
          break
        case 'pupils':
          for (const user of this.ADMIN_USERS) {
            if (user.role_key === 1 && user.powers_key === 'no') {
              this.filter_tasks.push(user)
            }
          }
          break
      }
    }
  },
  async created () {
    await this.IS_AUTHENTICATED()
    if (this.USER_POWERS !== 'admin') window.location.href = '/'
  },
  async mounted () {
    const isGetUsers = await this.ADMIN_GET_USERS()
    if (isGetUsers) {
      this.filter_tasks = this.ADMIN_USERS
    }
    await this.GET_COUNT()
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/styles/admin/users";
</style>
