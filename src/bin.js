#!/usr/bin/env node --experimental-worker
const bench = require('./index.js')
const path = require('path')
const { performance } = require('perf_hooks')

const start = performance.now()

const filename = path.resolve(
  /node/.test(process.argv[0]) ? process.argv[2] : process.argv[1],
)
;(async () => {
  const results = await bench(filename, {
    runs: 1000,
    loops: 50,
    // maxThreads: 1,
    ht: true,
  })
  const avg =
    results.reduce((total, current) => total + current) / results.length
  const stddev = Math.sqrt(
    results
      .map(entry => entry - avg)
      .map(diff => Math.pow(diff, 2))
      .reduce((total, current) => total + current) / results.length,
  )
  const max = Math.max(...results)
  const min = Math.min(...results)
  const end = performance.now()
  console.log(`avg:\t\t${avg.toFixed(3)}ms`)
  console.log(`stddev:\t\t${stddev.toFixed(3)}ms`)
  console.log(`max:\t\t${max.toFixed(3)}ms`)
  console.log(`min:\t\t${min.toFixed(3)}`)
  console.log(`total time:\t${(Math.floor(end - start) / 1000).toFixed(2)}s`)
})()
