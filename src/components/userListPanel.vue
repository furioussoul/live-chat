<script>
  import {mapGetters} from 'vuex'
  import {mapMutations} from 'vuex'
  export default{
    computed: {
      ...mapGetters(['userList'])
    },
    methods: {
      ...mapMutations(['addToSession'])
    }
  }
</script>
<template>
  <div>
    <ul>
      <li v-for="item in userList">
        <a @click="addToSession(item)" href="#">{{item}}</a>
      </li>
    </ul>
  </div>
</template>
<style lang="less" scoped>

</style>
