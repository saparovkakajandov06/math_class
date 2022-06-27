<template>
  <div class="form-block">
    <h2>Добавить нового пользователя</h2>
    <form action="">
      <p v-if="errors.fio" class="text-danger text-left m-0">Имя пользователя должно быть не короче 3 символов!</p>
      <input type="text" class="form-control" :class="errors.fio ? 'is-invalid': '' " placeholder="ФИО" v-model="user_data.fio">

      <p v-if="errors.email" class="text-danger text-left m-0">Некорректный e-mail</p>
      <input type="text" class="form-control" :class="errors.email ? 'is-invalid': '' " placeholder="Email" v-model="user_data.email">

      <p v-if="errors.password" class="text-danger text-left m-0">Пароль должен быть не короче 6 символов</p>
      <p v-if="errors.repeat_password" class="text-danger text-left m-0">Пароли не совпадают</p>
      <input type="password" class="form-control" :class="errors.password ? 'is-invalid': '' " placeholder="Пароль" v-model="user_data.password">
      <input type="password" class="form-control" :class="errors.repeat_password ? 'is-invalid': '' " placeholder="Повторите пароль" v-model="user_data.repeat_password">
      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <label class="input-group-text" for="inputGroupSelect01">Роль</label>
        </div>
        <select class="custom-select" :class="errors.role ? 'is-invalid': '' " id="inputGroupSelect01" v-model="user_data.role">
          <option value="2" selected>Преподаватель</option>
          <option value="1">Ученик</option>
        </select>
      </div>
      <div class="input-group mb-3" v-show="user_data.role === '2'">
        <div class="input-group-prepend">
          <label class="input-group-text" for="inputGroupSelect01">Доп. полномочия</label>
        </div>
        <select class="custom-select" :class="errors.power ? 'is-invalid': '' " id="inputGroupSelect02" v-model="user_data.power">
          <option value="no" selected>Нет</option>
          <option value="moderator">Модератор</option>
          <option value="admin">Администратор</option>
        </select>
      </div>
      <div class="buttons">
        <button type="button" class="btn btn-success" @click="save">Сохранить</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'AddUser',
  data: () => {
    return {
      user_data: {
        fio: '',
        email: '',
        password: '',
        repeat_password: '',
        role: '2',
        power: 'no'
      },
      errors: {
        fio: false,
        email: false,
        password: false,
        repeat_password: false,
        role: false,
        power: false
      }
    }
  },
  methods: {
    ...mapActions([
      'ADMIN_ADD_USER'
    ]),
    async save () {
      this.user_data.fio = this.user_data.fio.trim()
      this.user_data.email = this.user_data.email.trim()
      if (this.validateReg()) {
        const isSuccess = await this.ADMIN_ADD_USER(this.user_data)
        if (isSuccess) {
          this.$emit('add-user-complete')
          // Очищаем форму, но ждём пока закончится анимация
          setTimeout(() => {
            this.user_data = {
              fio: '',
              email: '',
              password: '',
              repeat_password: '',
              role: '',
              power: ''
            }
          }, 500)
        }
      }
    },
    notEmail (str) {
      const emailRegular = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      return !emailRegular.test(str)
    },
    validateReg () {
      let res = true
      if (this.user_data.fio.length < 3) {
        this.errors.fio = true
        res = false
      } else {
        this.errors.fio = false
      }

      if (this.notEmail(this.user_data.email)) {
        this.errors.email = true
        res = false
      } else {
        this.errors.email = false
      }

      if (this.user_data.password.length < 6) {
        this.errors.password = true
        res = false
      } else {
        this.errors.password = false

        if (this.user_data.password !== this.user_data.repeat_password) {
          this.errors.repeat_password = true
          res = false
        } else {
          this.errors.repeat_password = false
        }
      }

      if (this.user_data.role === '') {
        this.errors.role = true
        res = false
      } else {
        this.errors.role = false
      }

      if (this.user_data.power === '') {
        this.errors.power = true
        res = false
      } else {
        this.errors.power = false
      }

      return res
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/styles/components/modals-content";
</style>
