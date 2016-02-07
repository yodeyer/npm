var AsyncWrapper = function (fn) {
  this.fn = fn
  this.waitingTasks = []
}

AsyncWrapper.prototype.canRunTask = function (args) {}
AsyncWrapper.prototype.getNextTask = function () {}
AsyncWrapper.prototype.onTaskStart = function (args) {}
AsyncWrapper.prototype.onTaskEnd = function (args) {}

AsyncWrapper.prototype.runTask = function (args) {
  this.onTaskStart(args)
  var next = args.pop()
  var cb = function () {
    this.onTaskEnd(args)
    var nextTask = this.getNextTask()
    if (nextTask) {
      this.runTask(nextTask)
    }
    // call callback
    next.apply(null, arguments)
  }.bind(this)
  args.push(cb)
  process.nextTick(function () {
    this.fn.apply(null, args)
  }.bind(this))
}

AsyncWrapper.prototype.toFunction = function () {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    if (this.canRunTask(args)) {
      this.runTask(args)
    } else {
      this.waitingTasks.push(args)
    }
  }.bind(this)
}

exports = module.exports = AsyncWrapper
