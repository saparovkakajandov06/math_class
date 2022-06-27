<template>
  <div class="header d-flex">
    <div class="my_menu col-9 px-0">
      <a href="https://matclass.ru" target="new" style="text-decoration-line: none;margin-right: 25px;">
        <img src="../../public/static/img/logo.svg" height="64px" alt="">
      </a>
      <router-link class="menuNavItem" name="catalog" to="/">Каталог задач</router-link>
      <a href="/tester.html">Конструктор</a>
      <router-link class="menuNavItem" name="my_tasks" to="/my_tasks">Мои задачи</router-link>
      <router-link class="menuNavItem" name="favorites" to="/favorites">Избранное</router-link>
      <router-link
        v-if="USER_POWERS === 'moderator' || USER_POWERS === 'admin'"
        class="menuNavItem"
        name="moderation"
        to="/moderation"
      >Модерация</router-link>
      <router-link
        v-if="USER_POWERS === 'admin'"
        class="menuNavItem"
        name="admin"
        to="/admin"
      >Админка</router-link>
    </div>
    <div class="col-3 my-auto pr-4 text-right">
      <span @click="loginLogout()">
      <img src="../../public/static/img/user_logo.svg" alt="">
      <span class='mx-2'>{{ USER_FIO }}</span>
      <img src="../../public/static/img/select_arrow.svg" alt="">
      </span>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'MyHeader',
  mounted () {
    this.IS_AUTHENTICATED()

    const pathname = window.location.pathname
    switch (pathname) {
      case '/my_tasks':
        window.$('.menuNavItem[name=my_tasks]').addClass('active')
        break
      case '/favorites':
        window.$('.menuNavItem[name=favorites]').addClass('active')
        break
      case '/':
        window.$('.menuNavItem[name=catalog]').addClass('active')
        break
    }
    window.$('.menuNavItem').on('click', function () {
      window.$('.menuNavItem').removeClass('active')
      window.$(this).addClass('active')
    })
  },
  computed: {
    ...mapGetters([
      'USER_FIO',
      'USER_POWERS'
    ])
  },
  methods: {
    ...mapActions([
      'LOGOUT',
      'IS_AUTHENTICATED'
    ]),
    loginLogout () {
      if (this.USER_FIO === 'Авторизоваться') {
        window.$('#auth').modal('show')
      } else {
        this.LOGOUT()
      }
    }
  }
}
</script>
