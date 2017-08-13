<script>
  import {mapGetters} from 'vuex'
  import {mapMutations} from 'vuex'
  export default{
      computed:{
        ...mapGetters(['userList'])
      },
    methods:{
      ...mapMutations(['changeCurrentToSession'])
    }
  }
</script>
<template>
  <div>
    <ul>
      <li v-for="item in userList">
        <a @click="changeCurrentToSession(item)" href="#">{{item}}</a>
      </li>
    </ul>
  </div>
</template>
<style lang="less" scoped>

</style>
