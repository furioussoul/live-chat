export {
  flash_title,
  flashInfo
}
function flash_title() {
  //当窗口效果为最小化，或者没焦点状态下才闪动
  if (isMinStatus() || !window.focus) {
    newMsgCount();
  } else {
    document.title = 'live-chat';//窗口没有消息的时候默认的title内容
  }
}

//消息提示
var flashInfo = {}
function newMsgCount() {
  if (flashInfo.flash) {
    flashInfo.flash = false
    document.title = '【新消息】';
  }
}
//判断窗口是否最小化
//在Opera中还不能显示
var isMin = false;
function isMinStatus() {
  //除了Internet Explorer浏览器，其他主流浏览器均支持Window outerHeight 和outerWidth 属性
  if (window.outerWidth != undefined && window.outerHeight != undefined) {
    isMin = window.outerWidth <= 160 && window.outerHeight <= 27;
  } else {
    isMin = window.outerWidth <= 160 && window.outerHeight <= 27;
  }
  //除了Internet Explorer浏览器，其他主流浏览器均支持Window screenY 和screenX 属性
  if (window.screenY != undefined && window.screenX != undefined) {
    isMin = window.screenY < -30000 && window.screenX < -30000;//FF Chrome
  } else {
    isMin = window.screenTop < -30000 && window.screenLeft < -30000;//IE
  }
  return isMin;
}
