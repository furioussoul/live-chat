<script>
  import {mapGetters} from 'vuex'
  import {mapMutations} from 'vuex'
  export default{
    computed: {
      ...mapGetters(['userList'])
    },
    methods: {
      ...mapMutations(['addSession'])
    }
  }
</script>
<template>
  <div>
    当前登录用户
    <ul>
        <li v-for="item in userList">
        <img style="width: 20px;height: 20px;display: inline-block;vertical-align: middle" :src="item.img"/>
        <a @click="addSession(item)" href="#">{{item.loginName}}</a>
      </li>
    </ul>
  </div>
</template>
<style lang="less" scoped>

</style>
