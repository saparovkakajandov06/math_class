<template>
  <div>
    <Modals @authUser="authUser" />
    <MyHeader ref="header"/>
    <router-view @authUser="authUser" />
  </div>
</template>

<script>
// import { mapActions } from 'vuex'
import MyHeader from '../components/MyHeader'
import Modals from '../components/Modals'

export default {
  name: 'Main',
  components: {
    MyHeader,
    Modals
  },
  mounted () {
    // this.GET_CSRF_TOKEN()
  },
  methods: {
    // ...mapActions([
    //   'GET_CSRF_TOKEN'
    // ]),
    authUser () {
      this.$refs.header.IS_AUTHENTICATED()
    }
  }
}
</script>
