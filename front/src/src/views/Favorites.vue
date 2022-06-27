<template>
  <div>
    <div class="tasks" v-if="TASKS.length">
      <div class="border-bottom mx-0 row">
        <div class="px-2 col-2">Название задачи</div>
        <div @click="showFilter(1)" @mouseenter="showFilter(1)" class="px-2 col-1 position-relative">
          <div @mouseleave="hideFilters()" class='filter_selector dificult'>
            <div class='py-2'>
              <div class="filter_clear" @click="setFilter(1, 0)">Сбросить фильтр</div>
              <div class="filter_clear_all" @click="setFilter(0)">Сбросить все фильтры</div>
              <div name="1" @click="setFilter(1, 1)">1</div>
              <div name="2" @click="setFilter(1, 2)">2</div>
              <div name="3" @click="setFilter(1, 3)">3</div>
            </div>
          </div>
          {{ filter_difficult }} <img src="../assets/img/select_arrow.svg" class="ml-1" alt="">
        </div>
        <div @click="showFilter(2)" @mouseenter="showFilter(2)" class="px-2 col-1 position-relative">
          <div @mouseleave="hideFilters()" class='filter_selector class'>
            <div class='py-2'>
              <div class="filter_clear" @click="setFilter(2, 0)">Сбросить фильтр</div>
              <div class="filter_clear_all" @click="setFilter(0)">Сбросить все фильтры</div>
              <div name="1" @click="setFilter(2, 1)">1-3</div>
              <div name="2" @click="setFilter(2, 2)">4-6</div>
              <div name="3" @click="setFilter(2, 3)">7-9</div>
              <div name="4" @click="setFilter(2, 4)">10-11</div>
            </div>
          </div>
          {{ filter_class_str }} <img src="../assets/img/select_arrow.svg" class="ml-1" alt="">
        </div>
        <div class="px-2 col-2">Описание</div>
        <div @click="showFilter(3)" @mouseenter="showFilter(3)" class="px-2 col-2">
          <div @mouseleave="hideFilters()" class='filter_selector author'>
            <div class='py-2'>
              <div class="filter_clear" @click="setFilter(3, '')">Сбросить фильтр</div>
              <div class="filter_clear_all" @click="setFilter(0)">Сбросить все фильтры</div>
              <div
                v-for="author in AUTHORS"
                v-bind:key="author.id"
                :name="author.id"
                @click="setFilter(3, author.id)"
              >
                {{ author.name }}
              </div>
            </div>
          </div>
          <div class="author_block d-inline-flex">{{ filter_author_str }}</div>
          <img src="../assets/img/select_arrow.svg" class="ml-1" alt="">
        </div>
        <div class="px-2 col-2">Источник</div>
        <div class="px-2 col-1">Просмотров/Решено</div>
        <div class="px-2 col text-center">Действия</div>
      </div>
      <div
        v-for="task in TASKS"
        v-bind:key="task.id"
        @click="resolveTask(task.id)"
        class="mx-0 row"
      >
        <div class="px-2 col-2">Задача № {{ task.id }}</div>
        <div class="px-2 col-1">{{ getTaskDifficulty(task.dificulty) }}</div>
        <div class="px-2 col-1">{{ getTaskClass(task.class_level) }}</div>
        <div class="px-2 col-2"> {{ task.description }}</div>
        <div class="px-2 col-2"> {{ task.author_name }}</div>
        <div class="px-2 col-2"> {{ task.source_name }}</div>
        <div class="px-2 col-1"> {{ task.views }} / {{ task.resolved }}</div>
        <div class="px-2 col text-center">
          <img
            class="mr-3"
            @click.stop="showTaskLink(task.id)"
            title="скопировать ссылку на эту задачу"
            src="../assets/img/copy.svg"
            alt="">
          <img
            @click.stop="toggleFavoriteTask(task)"
            :class="task.favorite? '': 'gray_icon'"
            :title="task.favorite? 'удалить задачу из избранного': 'добавить задачу в избранное'"
            src="../assets/img/heart_2.svg"
            alt="">
        </div>
      </div>
    </div>
    <div class="mt-4 text-center" v-else>
      Задачи не найдены.<br><br>
      <span class="the_link" @click="setFilter(0)">Сбросить все фильтры</span>
    </div>
    <Pagination :pages="pages"
                :show_pages="show_pages"
                :request_page="page+1"
                @getPage="getTasks"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'

export default {
  name: 'Favorites',
  components: {
    Pagination
  },
  data: () => ({
    pages: [],
    show_pages: [],
    limit: 13,
    page: 0,

    filters: false,
    filter_difficult: 'Сложность',
    filter_class_str: 'Классы',
    filter_class: 0,
    filter_author: 0,
    filter_author_str: 'Автор'
  }),
  async mounted () {
    const isAuthenticated = await this.IS_AUTHENTICATED()

    if (isAuthenticated) {
      const isGetAuthors = await this.GET_AUTHORS()
      if (isGetAuthors) {
        const isGetFavoriteTasks = await this.GET_USER_FAVORITE_TASKS()
        if (isGetFavoriteTasks) {
          this.getTasks(0)
        }
      }
    } else {
      window.$('#auth').modal('show')
    }
  },
  computed: {
    ...mapGetters([
      'TASKS',
      'FAVORITE_TASKS',
      'AUTHORS'
    ])
  },
  methods: {
    ...mapActions([
      'IS_AUTHENTICATED',
      'GET_AUTHORS',
      'GET_USER_FAVORITE_TASKS',
      'GET_TASKS',
      'TOGGLE_FAVORITE_TASK'
    ]),

    async getTasks (page) {
      let url = '/api/get_tasks?favorite=yes&page=' + this.page + '&limit=' + this.limit
      if (this.filters) { url += this.getFilters() } // '&search='+this.search_str;

      this.page = page

      const getTasks = await this.GET_TASKS({ url, page })
      if (getTasks) {
        this.pages = getTasks.pages
        this.show_pages = getTasks.showPages
      }
    },

    async toggleFavoriteTask (task) {
      const isToggle = this.TOGGLE_FAVORITE_TASK(task)
      if (isToggle) {
        const taskId = await isToggle.then((response) => {
          return Number(response.taskId)
        })
        this.toggleTaskFavor(taskId)
      }
    },
    toggleTaskFavor (taskId) {
      for (const task of this.TASKS) {
        if (task.id === taskId) {
          task.favorite = !task.favorite
          break
        }
      }
      let addTaskFlag = true
      for (let i = 0; i < this.FAVORITE_TASKS.length; i++) {
        if (this.FAVORITE_TASKS[i].id === taskId) {
          this.FAVORITE_TASKS.splice(i, 1)
          addTaskFlag = false
          break
        }
      }
      if (addTaskFlag) { this.FAVORITE_TASKS.push({ id: taskId }) }
    },

    // Фильтры и прочее(не касается обмена данными)
    resolveTask (taskId) {
      window.location.href = '/resolver.html?id=' + taskId
    },
    showTaskLink (taskId) {
      const link = window.location.origin + '/resolver.html?id=' + taskId
      const input = window.$('#modal_link input:first')
      input.val(link)
      window.$('#modal_link').modal('show')
      window.setTimeout(this.copyPasteLink, 300)
    },

    copyPasteLink () {
      const input = window.$('#modal_link input:first')
      const str = window.$('#modal_link span:first')
      input.select()
      if (document.execCommand('copy')) { str.html('Ссылка на задачу скопирована в буфер обмена') } else { str.html('Для копирования ссылки в буфер обмена кликните по ней, затем нажмите CTRL-C и ENTER') }
      input.blur()
    },

    getTaskDifficulty (taskDifId) {
      const arr = ['', '1', '2', '3']
      return arr[taskDifId]
    },
    getTaskClass (taskClassId) {
      const arr = ['', '1-3', '4-6', '7-9', '10-11']
      return arr[taskClassId]
    },

    getFilters () {
      let res = '&filters=true'// '&search='+this.search_str;
      if (this.filter_difficult !== 'Сложность') { res += '&dificulty=' + this.filter_difficult }
      if (this.filter_class) { res += '&class_level=' + this.filter_class }
      if (this.filter_author) {
        for (let i = 0; i < this.AUTHORS.length; i++) {
          if (this.AUTHORS[i].id === this.filter_author) {
            if (this.AUTHORS[i].user_id) { res += '&user_id=' + this.AUTHORS[i].user_id } else { res += '&author_id=' + this.filter_author }
            break
          }
        }
      }
      return res
    },
    setFilter (filter, value) {
      window.setTimeout(this.hideFilters, 50)
      const classes = ['Классы', '1-3', '4-6', '7-9', '10-11']
      switch (filter) {
        case 1:
          this.filter_difficult = value
          window.$('.dificult>div>div').removeClass('my_bold')
          if (value === 0) { this.filter_difficult = 'Сложность' } else { window.$('.dificult>div>div[name=' + value + ']').addClass('my_bold') }
          break
        case 2:
          this.filter_class = value
          this.filter_class_str = classes[value]
          window.$('.class>div>div').removeClass('my_bold')
          if (value !== 0) { window.$('.class>div>div[name=' + value + ']').addClass('my_bold') }
          break
        case 3:
          this.filter_author = value
          window.$('.author>div>div').removeClass('my_bold')
          if (value) {
            for (let i = 0; i < this.AUTHORS.length; i++) {
              if (this.AUTHORS[i].id === value) {
                this.filter_author_str = this.AUTHORS[i].name
                window.$('.author>div>div[name=' + value + ']').addClass('my_bold')
                break
              }
            }
          } else { this.filter_author_str = 'Автор' }
          break
        default:
          this.filter_author_str = 'Автор'
          this.filter_author = 0
          this.filter_class = 0
          this.filter_class_str = 'Классы'
          this.filter_difficult = 'Сложность'

          window.$('.dificult>div>div').removeClass('my_bold')
          window.$('.class>div>div').removeClass('my_bold')
          window.$('.author>div>div').removeClass('my_bold')
          break
      }
      this.filters = !!(this.filter_class ||
        this.filter_difficult !== 'Сложность' ||
        this.filter_author)
      this.getTasks(0)
    },

    showFilter (filter) {
      switch (filter) {
        case 1:
          window.$('.dificult:first').css('display', 'block')
          break
        case 2:
          window.$('.class:first').css('display', 'block')
          break
        case 3:
          window.$('.author:first').css('display', 'block')
          break
      }
    },
    hideFilters () {
      window.$('.filter_selector').css('display', 'none')
    }
  }
}
</script>
