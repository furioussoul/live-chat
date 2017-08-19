<script>
  import {mapGetters} from 'vuex'
  import {mapMutations} from 'vuex'
  export default{
    computed: {
      ...mapGetters(['onlineUsers'])
    },
    methods: {
      ...mapMutations(['setCurrentSession'])
    }
  }
</script>
<template>
  <div>
    当前登录用户
    <ul>
      <li v-for="item in onlineUsers">
        <img style="width: 20px;height: 20px;display: inline-block;vertical-align: middle" :src="item.img"/>
        <a @click="setCurrentSession(item)" href="#">{{item.loginName}}</a>
        <span>{{item.notReadMsgCount}}</span>
      </li>
    </ul>
  </div>
</template>
<style lang="less" scoped>

</style>
