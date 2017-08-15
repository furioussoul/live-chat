<script>
  import {mapGetters} from "vuex";
  import {mapMutations} from "vuex";
  export default {
    computed: {
      ...mapGetters([
        'sessions',
        'currentToSession'
      ])
    },
    methods: {
      ...mapMutations([
          'changeCurrentToSession'
      ])
    }
  };
</script>

<template>
  <div class="list">
    <ul>
      <li v-for="(item, index) in sessions"
          :class="{ active: currentToSession.loginName ? item.loginName === currentToSession.loginName : index == 0}"
          @click="changeCurrentToSession(item.loginName)">
        <img class="avatar" width="30" height="30" :alt="item.loginName" :src="item.img">
        <p class="name">{{item.loginName}}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="less">
  .list {
    li {
      padding: 12px 15px;
      border-bottom: 1px solid #292C33;
      cursor: pointer;
      transition: background-color .1s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.03);
      }
      &.active {
        background-color: rgba(255, 255, 255, 0.5);
      }
    }
    .avatar, .name {
      vertical-align: middle;
    }
    .avatar {
      border-radius: 2px;
    }
    .name {
      display: inline-block;
      margin: 0 0 0 15px;
    }
  }
</style>
