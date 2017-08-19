import store from './store'

function findSession(loginName) {
  let sessions = store.getters.sessions
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].loginName === loginName) {
      return sessions[i]
    }
  }
}

function findUser(loginName) {
  let users = store.getters.users
  for (let i = 0; i < users.length; i++) {
    if (users[i].loginName === loginName) {
      return users[i]
    }
  }
}

function copyProperties(target, source) {
  if (!target || !source) {
    return console.error('target and source must not be null')
  }
  for (let key in source) {
    target[key] = source[key]
  }
}

function cache(key, value) {
  if (!value) {
    let valueStr = window.localStorage.getItem(key)
    return valueStr
      ? JSON.parse(valueStr)
      : null
  }

  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }
  window.localStorage.setItem(key, value)
}

let response = {
  ok: function (data) {
    this.code = 1
    this.rData = data
    return this
  },
  fail: function (msg) {
    this.code = 0
    this.rMsg = msg
    return this
  }
}

export {
  findSession,
  findUser,
  copyProperties,
  cache,
  response
}
