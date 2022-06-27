<template>
  <div class="my404">
    <div class="dino"></div>
    <div class="text-center w-25 mx-auto">
      <div v-if="doing">
        <h5 class="mt-4">Пароль изменен</h5>
      </div>
      <div v-else>
        <h5 class="mt-4 errors">{{ error }}</h5>
        <input class='mt-4 w-100' name='pw' type='password' placeholder="введите новый пароль*" v-model="new_pw">
        <input class='mt-4 w-100' name='pw2' type='password' placeholder="повторите новый пароль*" v-model="pw2">
        <button class="my-4 mx-auto btn_lt" type="button" @click='validePW()'>Сменить пароль</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthRegConfirm',
  data: () => ({
    doing: false,
    error: '',
    temp: '',
    new_pw: '',
    pw2: ''
  }),
  mounted () {
    if (window.location.search.substring(0, 6) !== '?temp=' || window.location.search.substring(6) === '') {
      window.myAlert('Не указан токен')
    } else {
      this.temp = window.location.search.substring(6)
    }
  },
  methods: {
    ajaxChangePasswordConfirm () {
      const url = 'http://127.0.0.1:8000/api/auth_set_new_user_pw'
      const method = 'POST'
      const data = {
        temp: this.temp,
        new_pw: this.new_pw
      }
      window.myAjax(method, url, data, this.myCallbackChangePasswordConfirm)
    },
    myCallbackChangePasswordConfirm (error, response) {
      if (error) {
        this.error = 'ошибка на сервере'
      } else {
        if (response.success === 'true') {
          this.doing = true
          this.$emit('authUser', response.user)
        } else {
          this.error = 'ошибка'
          window.myAlert(response.error)
        }
      }
    },
    validePW () {
      if (this.new_pw.length < 6) {
        this.error = 'Пароль должен содержать не менее 6 символов'
      } else if (this.new_pw === this.pw2) {
        this.ajaxChangePasswordConfirm()
        this.error = ''
      } else { this.error = 'Пароли различаются' }
    }
  }
}
</script>

<style scoped>

</style>
