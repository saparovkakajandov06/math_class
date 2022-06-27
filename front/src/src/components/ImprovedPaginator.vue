<template>
  <div>
    <div class="d-flex justify-content-center mb-12 my-4 pagination">
      <div
        class="pages page_first"
        title="открыть первую страницу"
        @click="getPage(1)"
      ></div>
      <div v-for="page in showed_pages"
           v-bind:key="page">
        <div
          :class="[page === currentPage ? 'active': '', 'page']"
          @click="getPage(page)"
        >
          {{ page }}
        </div>
      </div>
      <div
        class="pages page_last"
        title="открыть последнюю страницу"
        @click="getPage(countPages)">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImprovedPaginator',
  props: ['currentPage', 'countPages'],
  data: () => ({
    showed_pages: [],
    array_all_pages: []
  }),
  mounted () {
    this.initPaginator()
  },
  methods: {
    getPage (page) {
      this.$emit('getPage', page)
      this.initPaginator(page)
    },
    initPaginator (page) {
      const thisPage = page || this.currentPage

      for (let i = 1; i <= this.countPages; i++) {
        this.array_all_pages.push(i)
      }

      // Очищаем сначала, т.к. иначе он будет постоянно дополняться уже повторяющимися значениями
      this.showed_pages = []
      for (let i = thisPage - 3; i <= thisPage + 3; i++) {
        if (i > 0 && i <= this.countPages) {
          this.showed_pages.push(i)
        }
      }
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
