<template>
  <div
    class="add-new-user modal-window"
    tabindex="1"
    role="dialog"
    aria-labelledby="alertModalLabel"
    aria-hidden="true"
  >
    <div class="modal-window__content px-5 py-3 text-center">
      <span class="close" @click="$emit('close-modal', type_modal)">
        <img src="../../assets/img/modal_close.svg" alt="close">
      </span>

      <AddUser
        v-if="type_modal === 'add_user'"
        @add-user-complete="$emit('add-user-complete')"
      />
      <EditUser
        v-if="type_modal === 'edit_user'"
        :user="user"
        @delete-user="$emit('delete-user')"
        @edit-user="editUser"
      />
      <EditTask
        v-if="type_modal === 'edit_task'"
        :edit_task="edit_task"
        @complete-edit-task="completeEditTask"
        @delete-task="$emit('delete-task')"
        @lock-author="lockAuthor"
      />
      <TaskModeration
        v-if="type_modal === 'task_moderation'"
        :check_task="check_task"
        @moder-edit-task="$emit('moder-edit-task')"
        @moder-lock-author="moderLockAuthor"
        @moder-delete-task="$emit('moder-delete-task')"
        @confirm-task="moderConfirmTask"
        @reject-task="moderRejectTask"
      />
      <ConfirmDeleteUsers
        v-if="type_modal === 'confirm_delete_users'"
        :checkedUsers="checked_users"
        @confirm-delete="$emit('confirm-delete')"
        @cancel-delete="$emit('cancel-delete')"
      />

    </div>
  </div>
</template>

<script>
import AddUser from '@/components/Modals/AddUser'
import EditUser from '@/components/Modals/EditUser'
import EditTask from '@/components/Modals/EditTask'
import TaskModeration from '@/components/Modals/TaskModeration'
import ConfirmDeleteUsers from '@/components/Modals/ConfirmDeleteUsers'

export default {
  name: 'ModalsWrapper',
  props: {
    type_modal: {
      type: String
    },
    user: {
      type: Object
    },
    edit_task: {
      type: Object
    },
    check_task: {
      type: Object
    },
    checked_users: {
      type: Array
    }
  },
  components: {
    AddUser,
    EditUser,
    EditTask,
    TaskModeration,
    ConfirmDeleteUsers
  },
  methods: {
    editUser (user) {
      this.$emit('edit-user', user)
    },
    completeEditTask (task) {
      this.$emit('complete-edit-task', task)
    },
    lockAuthor (timeLock) {
      this.$emit('lock-author', timeLock)
    },
    moderLockAuthor (timeLock) {
      this.$emit('moder-lock-author', timeLock)
    },
    moderConfirmTask (moderComment) {
      this.$emit('confirm-task', moderComment)
    },
    moderRejectTask (moderComment) {
      this.$emit('reject-task', moderComment)
    }
  }
}
</script>

<style scoped lang='scss'>
.modal-window {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  max-height: 100%;
  max-width: 100%;
  background: rgba(0,0,0,.7);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: scroll;
  padding: 40px 0;
  @media screen and (max-height: 800px) {
    & {
      align-items: flex-start;
    }
  }
  .modal-window__content {
    position: relative;
    width: 90%;
    max-width: 500px;
    background: #fff;
    border-radius: 15px;
    border: none;
    box-shadow: 0px -12px 80px rgba(0, 0, 0, 0.07), 0px -2.48228px 45.9317px rgba(0, 0, 0, 0.0441918), 0px -0.433264px 36.3545px rgba(0, 0, 0, 0.0321203);
    .close {
      position: absolute;
      top: 15px;
      right: 15px;
    }
  }
}
</style>
