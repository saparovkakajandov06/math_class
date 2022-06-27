<template>
  <div class="form-block">
    <h2>Редактирование задачи №{{ task.id }}</h2>
    <form action="">
      <input type="text" placeholder="Автор" v-model="task.author">
      <input type="text" placeholder="Источник" v-model="task.source">
      <textarea class="form-control" id="task-description" placeholder="Описание задачи" v-model="task.description"></textarea>

      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <label class="input-group-text" for="selectDifficulty">Сложность</label>
        </div>
        <select class="custom-select" id="selectDifficulty" v-model="task.difficulty">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </div>

      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <label class="input-group-text" for="selectClass">Классы</label>
        </div>
        <select class="custom-select" id="selectClass" v-model="task.class_level_key">
          <option value="1">1-3</option>
          <option value="2">4-6</option>
          <option value="3">7-9</option>
          <option value="4">10-11</option>
        </select>
      </div>
      <p class="text-left"><a :href="'/resolver.html?id=' + task.id" target="_blank">Открыть задание</a></p>
      <hr>
      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <label class="input-group-text" for="selectStatus">Статус</label>
        </div>
        <select class="custom-select" id="selectStatus" v-model="task.status">
          <option value="Проверка">Проверка</option>
          <option value="Опубликована">Опубликована</option>
          <option value="Отклонено">Отклонено</option>
        </select>
      </div>
      <p v-if="edit_task.real_creator === null">Создатель задачи удалён. {{ edit_task.real_creator }}</p>
      <div class="custom-control custom-checkbox text-left" v-if="edit_task.real_creator !== null">
        <input type="checkbox" class="custom-control-input" id="customCheck1" v-model="lock_user">
        <label class="custom-control-label" for="customCheck1">Заблокировать автора</label>
      </div>

      <div class="input-group mb-3" v-show="lock_user" v-if="edit_task.real_creator !== null">
        <div class="input-group-prepend">
          <label class="input-group-text" for="select-lock-user">Время блокировки</label>
        </div>
        <select class="custom-select" id="select-lock-user" v-model="time_lock">
          <option value="forever">Навсегда</option>
          <option value="1d">День</option>
          <option value="3d">3 дня</option>
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
        </select>
      </div>
      <div class="buttons">
        <div class="main-buttons" v-if="!lock_user">
          <button type="button" class="btn btn-success" @click="$emit('complete-edit-task', task)">Сохранить</button>
          <button type="button" class="btn btn-danger" @click="$emit('delete-task')">Удалить</button>
        </div>
        <button
          type="button"
          class="btn btn-outline-warning"
          v-if="lock_user"
          @click="$emit('lock-author', time_lock)"
        >Заблокировать и удалить задачу</button>
      </div>

    </form>
  </div>
</template>

<script>
export default {
  name: 'EditTask',
  props: {
    edit_task: {
      type: Object
    }
  },
  data: () => {
    return {
      lock_user: false,
      time_lock: 'forever',
      task: {
        id: '',
        author: '',
        author_id: '',
        difficulty: 0,
        class_level_key: '',
        source: '',
        description: '',
        status: ''
      }
    }
  },
  watch: {
    // Отслеживаем изменение пропсов. То есть выбор другой задачи из списка
    edit_task: function () {
      this.task.id = this.edit_task.id
      this.task.author = this.edit_task.author
      this.task.author_id = this.edit_task.author_id
      this.task.difficulty = this.edit_task.difficulty
      this.task.class_level_key = this.edit_task.class_level_key
      this.task.source = this.edit_task.source
      this.task.description = this.edit_task.description
      this.task.status = this.edit_task.status
    }
  }

}
</script>

<style scoped lang="scss">
@import "src/assets/styles/components/modals-content";
</style>
