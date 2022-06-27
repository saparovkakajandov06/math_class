<template>
  <div>
    <div class="d-flex justify-content-center mb-12 my-4 pagination">
      <div
        class="pages page_first"
        title="открыть первую страницу"
        @click="getPage(0)"
      ></div>
      <div v-for="page in show_pages"
           v-bind:key="page">
        <div
          :class="[page === request_page ? 'active': '', 'page']"
          @click="getPage(page - 1)"
        >
          {{ page }}
        </div>
      </div>
      <div
        class="pages page_last"
        title="открыть последнюю страницу"
        @click="getPage(pages.length - 1)">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: ['request_page', 'pages', 'show_pages'],
  data: () => ({
    number_of_pages_to_view: 4 // доступны 7 страниц, максимально 3 слева от активной и 3 справа
  }),
  methods: {
    getPage (page) {
      this.$emit('getPage', page)
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  min-width: 40px;
  height: 40px;
  padding-top: 7px;
  padding-left: 4px;
  padding-right: 4px;
  text-align: center;
  color: #545454;
  cursor: pointer;
  font-size: 17px;
  &:hover {
    font-weight: bold;
  }
  &.active {
    border: 2px solid #bfbfbf;
    border-radius: 5px;
    padding-top: 5px;
    cursor: default;
    font-weight: bold;
  }
  &_first {
    background: url('../assets/img/page_first.svg') no-repeat center;
  }
  &_last {
    background: url('../assets/img/page_last.svg') no-repeat center;
  }
}
.pages {
  cursor: pointer;
  width: 40px;
  filter: grayscale(1);
}
</style>
