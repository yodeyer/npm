var AsyncWrapper = require('./async-wrapper')

var AsyncUnique = function (fn) {
  AsyncWrapper.call(this, fn)
  this.uniqueTokens = []
}

AsyncUnique.prototype = Object.create(AsyncWrapper.prototype)
AsyncUnique.prototype.AsyncUnique = AsyncUnique

AsyncUnique.prototype.canRunUniqTask = function (name) {
  return this.uniqueTokens.indexOf(name) === -1
}

AsyncUnique.prototype.getNextTask = function () {
  AsyncWrapper.prototype.getNextTask.apply(this.argument)
  var id = -1
  // use some() for old nodejs versions
  var found = this.waitingTasks.some(function (args) {
    id++
    return this.canRunUniqTask(args[0])
  }.bind(this))
  if (found) {
    return this.waitingTasks.splice(id, 1)[0]
  }
}

AsyncUnique.prototype.onTaskStart = function (args) {
  AsyncWrapper.prototype.onTaskStart.apply(this.argument)
  this.uniqueTokens.push(args[0])
}

AsyncUnique.prototype.onTaskEnd = function (args) {
  AsyncWrapper.prototype.onTaskEnd.apply(this.argument)
  this.uniqueTokens.splice(this.uniqueTokens.indexOf(args[0]), 1)
}

AsyncUnique.prototype.canRunTask = function (args) {
  AsyncWrapper.prototype.canRunTask.apply(this.argument)
  return this.canRunUniqTask(args[0])
}

/**
 * Avoid parallel executions of a function for the same first parameter
 *
 * @param {Function} fn Function to wrap
 *
 * @return {Function} The throttled function
 */
exports = module.exports = function (fn) {
  return (new AsyncUnique(fn)).toFunction()
}
