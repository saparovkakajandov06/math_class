<template>
  <div class="form-block">
    <h2>Редактирование пользователя</h2>
    <form action="">
      <input type="text" placeholder="ФИО" v-model="edit_user.user_fio">
      <input type="text" placeholder="E-mail" v-model="edit_user.user_email">

      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <label class="input-group-text" for="editSelectRole">Роль</label>
        </div>
        <select class="custom-select" id="editSelectRole" v-model="edit_user.user_role">
          <option value="1" :selected="edit_user.user_role === 'Ученик'">Ученик</option>
          <option value="2" :selected="edit_user.user_role === 'Преподаватель'">Преподаватель</option>
        </select>
      </div>

      <div class="input-group mb-3" v-show="Number(edit_user.user_role) === 2">
        <div class="input-group-prepend">
          <label class="input-group-text" for="editSelectPowers">Доп. полномочия</label>
        </div>
        <select class="custom-select" id="editSelectPowers" v-model="edit_user.user_powers">
          <option value="no" :selected="edit_user.user_powers === 'no'">Нет</option>
          <option value="moderator" :selected="edit_user.user_powers === 'moderator'">Модератор</option>
          <option value="admin" :selected="edit_user.user_powers === 'admin'">Администратор</option>
        </select>
      </div>

      <div class="custom-control custom-checkbox text-left">
        <input
          type="checkbox"
          class="custom-control-input"
          id="editLockUser"
          v-model="edit_user.user_lock">
        <label class="custom-control-label" for="editLockUser">Заблокировать пользователя</label>
      </div>

      <p v-if="edit_user.user_lock && user.lock" class="text-left">Пользователь заблокирован {{ user.lock_forever ? 'Навсегда' : `до ${user.lock_time}` }}</p>

      <div class="input-group mb-3" v-if="!user.lock && edit_user.user_lock">
        <div class="input-group-prepend">
          <label class="input-group-text" for="editSelectTimeLock">Время блокировки</label>
        </div>
        <select class="custom-select" id="editSelectTimeLock" v-model="edit_user.user_type_lock_time">
          <option value="forever">Навсегда</option>
          <option value="1d">День</option>
          <option value="3d">3 дня</option>
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
        </select>
      </div>

      <div class="buttons">
        <div class="main-buttons">
          <button type="button" class="btn btn-success" @click="$emit('edit-user', edit_user)">Сохранить</button>
          <button type="button" class="btn btn-danger" @click="$emit('delete-user')">Удалить пользователя</button>
        </div>
      </div>

    </form>
  </div>
</template>

<script>
export default {
  name: 'EditUser',
  props: {
    user: {
      type: Object,
      require: true
    }
  },
  data: () => {
    return {
      edit_user: {
        user_id: 0,
        user_type_lock_time: 'forever',
        user_fio: '',
        user_email: '',
        user_lock: false,
        user_role: 0,
        user_powers: ''
      }
    }
  },
  watch: {
    // Отслеживаем изменение пропсов. То есть выбор другого юзера из списка
    user: function () {
      this.edit_user.user_id = this.user.id
      this.edit_user.user_fio = this.user.fio
      this.edit_user.user_email = this.user.email
      this.edit_user.user_lock = this.user.lock
      this.edit_user.user_lock = this.user.lock
      this.edit_user.user_role = this.user.role_key
      this.edit_user.user_powers = this.user.powers_key
      if (this.user.lock) {
        this.edit_user.user_type_lock_time = this.user.type_lock_time
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/styles/components/modals-content";
</style>
