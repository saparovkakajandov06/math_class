<template>
  <div>
    <div class="modal fade" id="alertModal" tabindex="1" role="dialog" aria-labelledby="alertModalLabel" aria-hidden="true"
         style="z-index: 3000;">
      <div class="modal-dialog mx-auto mt-5 pt-5" role="document">
        <div class="modal-content" style="margin-top: 110px;box-shadow: 0 4px 8px rgba(0, 0, 0, 0.35);">
          <div class="head mt-4 text-center">
            <img class='mb-3' src="../assets/img/alert.svg" alt="">
          </div>
          <div class="modal-body">
            <h5 class="mt-4 mb-3 text-center" id="alertModalMessage"></h5>
          </div>
          <div @click='hideModal("#alertModal")' class="close"></div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="modal_link" tabindex="-1" role="dialog" aria-labelledby="managerCopyPastLabel" aria-hidden="true">
      <div class="modal-dialog mx-auto mt-5 pt-5" role="document">
        <div class="modal-content">
          <div class="modal-body px-5 text-center">
            <div class="head my-4 text-center">
              <img src="../assets/img/modal_h4.svg" alt="">
              <br>
              <br>
              <span>Ссылка на задачу скопирована в буфер обмена</span>
            </div>
            <input @click="copyPasteLink" class='copy_link w-100 mb-4'>
          </div>
          <div @click='hideModal("#modal_link")' class="close"></div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="auth" tabindex="-1" role="dialog" aria-labelledby="managerCopyPastLabel" aria-hidden="true"   data-backdrop="static" data-keyboard="false"
         style="z-index: 2000; background-color: #31200b78">
      <div class="modal-dialog mx-auto mt-5 pt-5" role="document" style='margin-top: 160px!important;'>
        <div class="modal-content">
          <div class="modal-body px-5 text-center">
            <div class="head2 auth_header my-4 text-center">
              <img src="../assets/img/task_about.svg" alt="">
              <br>
              <br>
              <span class='active' name='auth'>Авторизация</span> <span name='reg'>Регистрация</span>
            </div>
            <div class='auth_content'>
              <div name='auth'>
                <input class='w-100' name='login' placeholder="логин (e-mail)">
                <input class='mt-4 w-100' name='pw' type='password' placeholder="пароль">
                <span class='forget_pw'>забыли пароль?</span><br>
                <button class="my-3 mx-auto" type="button" @click='getAuth()'>Войти</button>
              </div>
              <div class='my_hidden' name='reg'>
                <input class='w-100' name='fio' placeholder="Фамилия* Имя* Отчество">
                <select name='roles' class='mt-4 w-100'>
                  <option value=''>Роль*</option>
                  <option v-for="role in ROLES" v-bind:key="role.id" :value="role.id">{{role.name}}</option>
                </select>
                <input class='mt-4 w-100' name='login' placeholder="логин* (e-mail)">
                <input class='mt-4 w-100' name='pw' type='password' placeholder="пароль*">
                <input class='mt-4 w-100' name='pw2' type='password' placeholder="повторите пароль*">
                <button class="my-4 mx-auto" type="button" @click='getReg()'>Зарегистрироваться</button>
              </div>
              <div class='my_hidden' name='forget'>
                <input class='w-100' name='login' placeholder="логин (e-mail)">
                <button class="my-4 mx-auto" type="button" @click='getPassword()'>Восстановить пароль</button>
              </div>
            </div>
          </div>
          <div @click='goToCatalog()' class="close"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'Modals',
  mounted () {
    this.GET_ROLES()
  },
  computed: {
    ...mapGetters([
      'ROLES'
    ])
  },
  methods: {
    ...mapActions([
      'GET_ROLES',
      'FORGET_PASSWORD',
      'LOGIN',
      'REGISTRATION'
    ]),

    hideModal (modalId) {
      window.$(modalId).modal('hide')
    },

    copyPasteLink () {
      window.prompt('Скопировать в клипбоард: Ctrl+C, Enter', window.$('#modal_link input:first').val())
    },

    goToCatalog () {
      window.$('#auth').modal('hide')
      if (window.location.pathname !== '/') window.location.href = '/'
    },

    getPassword () {
      if (this.validateLogin('forget')) return false

      const el = window.$('#auth div[name=forget]')
      const login = el.find('input[name=login]').val()

      this.FORGET_PASSWORD(login)
    },

    validateLogin (block) {
      let res = false
      const el = window.$('#auth div[name=' + block + ']')

      if (this.notEmail(el.find('input[name=login]').val())) {
        el.find('input[name=login]').addClass('error_input')
        res = true
      } else {
        el.find('input[name=login]').removeClass('error_input')
      }

      return res
    },

    getAuth () {
      if (this.validateLogin('auth')) return false

      const el = window.$('#auth div[name=auth]')

      const login = el.find('input[name=login]').val()
      const pw = el.find('input[name=pw]').val()

      this.LOGIN({ login, pw })
      this.$emit('authUser')
    },

    getReg () {
      if (this.validateReg()) return false

      const el = window.$('#auth div[name=reg]')
      const data = {
        fio: el.find('input[name=fio]').val(),
        login: el.find('input[name=login]').val(),
        roleId: el.find('select[name=roles]').val(),
        pw: el.find('input[name=pw]').val()
      }

      this.REGISTRATION(data)
    },

    validateReg () {
      let res = false
      const el = window.$('#auth div[name=reg]')
      if (el.find('input[name=fio]').val().length < 3) {
        el.find('input[name=fio]').addClass('error_input')
        res = true
      } else {
        el.find('input[name=fio]').removeClass('error_input')
      }

      if (this.notEmail(el.find('input[name=login]').val())) {
        el.find('input[name=login]').addClass('error_input')
        res = true
      } else {
        el.find('input[name=login]').removeClass('error_input')
      }

      if (el.find('input[name=pw]').val().length < 6) {
        el.find('input[name=pw]').addClass('error_input')
        res = true
      } else {
        el.find('input[name=pw]').removeClass('error_input')

        if (el.find('input[name=pw]').val() !== el.find('input[name=pw2]').val()) {
          el.find('input[name=pw2]').addClass('error_input')
          res = true
        } else {
          el.find('input[name=pw2]').removeClass('error_input')
        }
      }

      if (el.find('select[name=roles]').val() === '') {
        el.find('select[name=roles]').addClass('error_input')
        res = true
      } else {
        el.find('select[name=roles]').removeClass('error_input')
      }

      return res
    },

    notEmail (str) {
      const emailRegular = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      return !emailRegular.test(str)
    }
  }
}
</script>
