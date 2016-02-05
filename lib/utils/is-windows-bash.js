'use strict'
var isWindows = require('./is-windows.js')
var isWindowsShell = require('./is-windows-shell.js')
module.exports = isWindows && /^MINGW(32|64)$/.test(process.env.MSYSTEM)
