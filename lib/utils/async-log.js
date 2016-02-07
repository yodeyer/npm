var AsyncWrapper = require('./async-wrapper')

var logTime = function (args, action, num) {
  var diff = process.hrtime()
  console.log('numDownload;' + num + ';' + args[0] + ';' + args[1] + ';' + action + ';' + (diff[0] * 1e9 + diff[1]))
}

var AsyncLog = function (fn, limit) {
  AsyncWrapper.call(this, fn)
  this.runningTasks = 0
}

AsyncLog.prototype = Object.create(AsyncWrapper.prototype)
AsyncLog.prototype.AsyncLog = AsyncLog

AsyncLog.prototype.onTaskStart = function (args) {
  AsyncWrapper.prototype.onTaskStart.apply(this.argument)
  this.runningTasks++
  logTime(args, '>', this.runningTasks)
}

AsyncLog.prototype.onTaskEnd = function (args) {
  AsyncWrapper.prototype.onTaskEnd.apply(this.argument)
  this.runningTasks--
  logTime(args, '<', this.runningTasks)
}

AsyncLog.prototype.canRunTask = function (args) {
  return true
}

/**
 * Limit the number of parallel executions of an asynchronous function
 *
 * @param {Function} fn Function to wrap
 * @param {Number} limit Maximum number of parallel executions
 *
 * @return {Function} The throttled function
 */
exports = module.exports = function (fn, limit) {
  return (new AsyncLog(fn, limit)).toFunction()
}
