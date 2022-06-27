<template>
  <div class="form-block">
    <h2>Проверка задачи №{{ task.id }}</h2>
    <form action="">
      <input
        type="text"
        placeholder="Автор"
        id="author_task"
        v-model="task.author"
        :disabled="!edit_mode"
      >
      <input
        type="text"
        placeholder="Источник"
        id="source_task"
        v-model="task.source"
        :disabled="!edit_mode"
      >

      <textarea
        class="form-control"
        placeholder="Описание задачи"
        id="task_description"
        rows="4"
        v-model="task.description"
        :disabled="!edit_mode"
      ></textarea>

      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <label class="input-group-text" for="selectDifficulty">Сложность</label>
        </div>
        <select class="custom-select" id="selectDifficulty" v-model="task.difficulty" :disabled="!edit_mode">
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
        <select class="custom-select" id="selectClass" v-model="task.class_level_key" :disabled="!edit_mode">
          <option value="1">1-3</option>
          <option value="2">4-6</option>
          <option value="3">7-9</option>
          <option value="4">10-11</option>
        </select>
      </div>
      <div class="row">
        <div class="col-6 text-left">
          <p><a :href="'/resolver.html?id=' + task.id" target="_blank">Открыть задание</a></p>
        </div>
        <div class="col-6 text-right">
          <p
            class="button-edit-task"
            @click="edit_mode = true"
            v-if="edit_mode === false"
          >Изменить задачу</p>
          <p
            class="button-edit-task"
            @click="completeEditTask"
            v-if="edit_mode === true"
          >Сохранить</p>
        </div>
      </div>
      <hr>
      <template v-if="edit_mode === false">
        <textarea
          class="form-control"
          name="comment"
          id="commentForTask"
          v-model="moderator_comment"
          v-if="!lock_user"
          placeholder="Оставить комментарий"
        ></textarea>
        <div class="custom-control custom-checkbox text-left">
          <input type="checkbox" class="custom-control-input" id="customCheck1" v-model="lock_user">
          <label class="custom-control-label" for="customCheck1">Заблокировать автора</label>
        </div>
        <div class="input-group mb-3" v-show="lock_user">
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
            <button
              type="button"
              class="btn btn-success"
              @click="$emit('confirm-task', moderator_comment)"
            >Одобрить</button>
            <button
              type="button"
              class="btn btn-warning"
              @click="$emit('reject-task', moderator_comment)"
            >Отклонить</button>
          </div>
          <button
            type="button"
            class="btn btn-danger"
            v-if="!lock_user"
            @click="$emit('moder-delete-task')"
          >Удалить задачу</button>
          <button
            type="button"
            class="btn btn-outline-warning"
            v-if="lock_user"
            @click="$emit('moder-lock-author', time_lock)"
          >Заблокировать и удалить задачу</button>
        </div>
      </template>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'TaskModeration',
  props: {
    check_task: {
      type: Object
    }
  },
  data: () => {
    return {
      lock_user: false,
      time_lock: 'forever',
      edit_mode: false,
      task: {
        id: '',
        author: '',
        author_id: '',
        difficulty: '',
        class_level_key: '',
        source: '',
        description: ''
      },
      moderator_comment: ''
    }
  },
  methods: {
    ...mapActions([
      'ADMIN_EDIT_TASK'
    ]),
    async completeEditTask () {
      const isEdit = await this.ADMIN_EDIT_TASK(this.task)
      if (isEdit) {
        this.edit_mode = false
        this.$emit('moder-edit-task')
        window.myAlert('Задание изменено')
      }
    }
  },
  watch: {
    // Отслеживаем изменение пропсов. То есть выбор другой задачи из списка
    check_task: function () {
      this.task.id = this.check_task.id
      this.task.author = this.check_task.author
      this.task.author_id = this.check_task.author_id
      this.task.difficulty = this.check_task.difficulty
      this.task.class_level_key = this.check_task.class_level_key
      this.task.source = this.check_task.source
      this.task.description = this.check_task.description
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/styles/components/modals-content";

hr {
  margin-top: 0;
}
.button-edit-task {
  display: inline-block;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
input:disabled {
  background: #e9ecef;
}
</style>
