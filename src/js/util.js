import store from './store'
import logger from './logger'

function findSession(loginName) {
  let sessions = store.getters.sessions
  for(let i = 0;i<sessions.length;i++){
    if (sessions[i].loginName === loginName) {
      return sessions[i]
    }
  }
}

function findUser(loginName) {
  let users = store.getters.users
  for(let i = 0;i<users.length;i++){
    if (users[i].loginName === loginName) {
      return users[i]
    }
  }
}

function copyProperties(target, source) {
  if(!target || !source){
    return logger.error('target and source must not be null')
  }
  for(let key in source){
    target[key] = source[key]
  }
}

function cache(key, value) {
  if (!value) {
    let valueStr = window.localStorage.getItem(key)
    return valueStr
      ? JSON.stringify(valueStr)
      : null
  }

  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }
  window.localStorage.setItem(key, value)
}

export {
  findSession,
  findUser,
  copyProperties,
  cache
}
