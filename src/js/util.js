function findSession(sessions,loginName) {
  for(var i = 0;i<sessions.length;i++){
    if (sessions[i].loginName === loginName) {
      return sessions[i]
    }
  }
}

export {
  findSession
}
