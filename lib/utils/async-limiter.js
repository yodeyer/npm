var AsyncWrapper = require('./async-wrapper')

var AsyncLimiter = function (fn, limit) {
  AsyncWrapper.call(this, fn)

  this.limit = limit
  this.runningTasks = 0
}

AsyncLimiter.prototype = Object.create(AsyncWrapper.prototype)
AsyncLimiter.prototype.AsyncLimiter = AsyncLimiter

AsyncLimiter.prototype.getNextTask = function () {
  AsyncWrapper.prototype.getNextTask.apply(this.argument)
  return this.waitingTasks.shift()
}

AsyncLimiter.prototype.onTaskStart = function (args) {
  AsyncWrapper.prototype.onTaskStart.apply(this.argument)
  this.runningTasks++
}

AsyncLimiter.prototype.onTaskEnd = function (args) {
  AsyncWrapper.prototype.onTaskEnd.apply(this.argument)
  this.runningTasks--
}

AsyncLimiter.prototype.canRunTask = function (args) {
  AsyncWrapper.prototype.canRunTask.apply(this.argument)
  return this.runningTasks < this.limit
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
  return (new AsyncLimiter(fn, limit)).toFunction()
}
