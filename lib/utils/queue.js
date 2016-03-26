module.exports = function (fn) {
  var waitingTasks = []
  var beforeHooks = []
  var afterHooks = []
  var canRunTaskConditions = []

  var canRunTask = function (args) {
    return canRunTaskConditions.every(function (isTaskRunnable) {
      return isTaskRunnable(args)
    })
  }

  var getNextTask = function () {
    var id = -1
    // use some() for old nodejs versions
    var found = waitingTasks.some(function (args) {
      id++
      return canRunTask(args)
    })
    if (found) {
      return waitingTasks.splice(id, 1)[0]
    }
  }

  var executeHooks = function (hooks, args) {
    hooks.forEach(function (hook) {
      hook(args)
    })
  }

  var runTask = function (args) {
    executeHooks(beforeHooks, args)
    var next = args.pop()
    // wrap callback
    var cb = function () {
      executeHooks(afterHooks, args)
      var nextTask = getNextTask()
      if (nextTask) {
        runTask(nextTask)
      }
      // call initial callback
      next.apply(null, arguments)
    }
    // replace initial callback by the new one
    args.push(cb)
    process.nextTick(function () {
      fn.apply(null, args)
    })
  }

  /**
   * Wrap function and add methods to manage scheduling
   *
   * @param {Function} fn Function to wrap
   *
   * @return {Function} The wrapped function
   */
  var wrappedFunction = function () {
    var args = Array.prototype.slice.call(arguments)
    if (canRunTask(args)) {
      runTask(args)
    } else {
      waitingTasks.push(args)
    }
  }

  /**
   * Avoid parallel executions of a function for the same first parameter
   *
   * @return {Function} The wrapped function
   */
  wrappedFunction.unique = function () {
    var uniqueTokens = []

    canRunTaskConditions.push(function (args) {
      return uniqueTokens.indexOf(args[0]) === -1
    })

    beforeHooks.push(function (args) {
      uniqueTokens.push(args[0])
    })

    afterHooks.push(function (args) {
      uniqueTokens.splice(uniqueTokens.indexOf(args[0]), 1)
    })

    return wrappedFunction
  }

  /**
   * Limit the number of parallel executions of an asynchronous function
   *
   * @param {Number} limit Maximum number of parallel executions
   *
   * @return {Function} The wrapped function
   */
  wrappedFunction.limit = function (limit) {
    var runningTasks = 0
    var log = function (args) {
      // var hrtime = process.hrtime()
      // var date = ( hrtime[0] * 1000000 + hrtime[1] / 1000 )
      // console.log('status;%s;%d;%d;%d', args[0], date, runningTasks, waitingTasks.length)
    }

    beforeHooks.push(function (args) {
      runningTasks++
      log(args)
    })

    afterHooks.push(function (args) {
      runningTasks--
      log(args)
    })

    canRunTaskConditions.push(function (args) {
      return runningTasks < limit
    })

    return wrappedFunction
  }

  return wrappedFunction
}
