<template>
  <div class="confirm-delete-users">
    <h2>Вы уверены, что хотите удалить пользователей({{ checkedUsers.length }}):</h2>
    <ul>
      <li v-for="(user, index) in checkedUsers" :key="user.id">
        {{ index+1 }}) {{ user.fio }} - {{ user.role_str }} <span v-if="user.powers_key !== 'no'">({{ user.powers_str}})</span>
      </li>
    </ul>
    <hr>
    <div class="buttons">
      <div class="main-buttons">
        <button class="btn btn-danger" @click="$emit('confirm-delete')">Подтвердить</button>
        <button class="btn btn-info" @click="$emit('cancel-delete')">Отменить</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmDeleteUsers',
  props: {
    checkedUsers: {
      type: Array
    }
  }
}
</script>

<style scoped lang='scss'>
@import "src/assets/styles/components/modals-content";
</style>
