<template>
  <div class="my404">
    <div class="dino"></div>
    <div>
      <h1>Подтверждение регистрации</h1>
      <h5 class="mt-4">{{ wait_str }}</h5>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthRegConfirm',
  data: () => ({
    wait_str: 'ждите...'
  }),
  mounted () {
    if (window.location.search.substring(0, 11) !== '?reg_token=' || window.location.search.substring(11) === '') {
      window.myAlert('Не указан токен')
    } else {
      this.ajaxRegConfirm(window.location.search.substring(11))
    }
  },
  methods: {
    ajaxRegConfirm (regToken) {
      const url = 'http://127.0.0.1:8000/api/auth_reg_confirm?reg_token=' + regToken
      const method = 'GET'
      window.myAjax(method, url, {}, this.myCallbackRegConfirm)
    },
    myCallbackRegConfirm (error, response) {
      if (error) {
        this.wait_str = 'ошибка на сервере'
        window.myAlert(response.message)
      } else if (response.success === 'true') {
        this.wait_str = 'Поздравляем! Регистрация подтверждена. Вы авторизованы.'
        window.myAlert(response.message)
        this.$emit('authUser', response.user)
      } else {
        this.wait_str = 'ошибка на сервере'
        window.myAlert(response.error)
      }
    }
  }
}
</script>

<style scoped>

</style>
