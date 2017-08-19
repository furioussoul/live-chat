<script>
  import {mapGetters} from 'vuex'
  import {mapMutations} from 'vuex'
  export default{
    computed: {
      ...mapGetters(['users'])
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
        <li v-for="item in users">
        <img style="width: 20px;height: 20px;display: inline-block;vertical-align: middle" :src="item.img"/>
        <a @click="setCurrentSession(item)" href="#">{{item.loginName}}</a>
      </li>
    </ul>
  </div>
</template>
<style lang="less" scoped>

</style>
