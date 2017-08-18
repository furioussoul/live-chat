import store from './store'

function findSession(loginName) {
  var sessions = store.getters.sessions
  for(var i = 0;i<sessions.length;i++){
    if (sessions[i].loginName === loginName) {
      return sessions[i]
    }
  }
}

function findUser(loginName) {
  var users = store.getters.users
  for(var i = 0;i<users.length;i++){
    if (users[i].loginName === loginName) {
      return users[i]
    }
  }
}

export {
  findSession,
  findUser
}
