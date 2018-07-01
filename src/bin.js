#!/usr/bin/env node --experimental-worker
const bench = require('./index.js')
const path = require('path')
const { performance } = require('perf_hooks')

const start = performance.now()

const filename = path.resolve(
  /node/.test(process.argv[0]) ? process.argv[2] : process.argv[1]
)
;(async () => {
  const results = await bench(filename)
  const avg =
    results.reduce((total, current) => total + current) / results.length
  const end = performance.now()
  console.log(`avg: ${avg}ms`)
  console.log(`total time: ${(Math.floor(end - start) / 1000).toFixed(2)}s`)
})()
