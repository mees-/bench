#!/usr/bin/env node --experimental-worker
const bench = require('./index.js')
const path = require('path')
const { performance } = require('perf_hooks')
const semver = require('semver')

if (!semver.gte(process.version, '10.5.0')) {
  console.error('At least Node 10.5.0 is required, please update')
  process.exit(1)
}

const start = performance.now()

const defaultOptions = {
  runs: 1000,
  loops: 50,
  // maxThreads: the amount of cores, is halved if ht is true to avoid hyperthreading,
  ht: true,
}

const filename = path.resolve(
  /node/.test(process.argv[0]) ? process.argv[2] : process.argv[1],
)
;(async () => {
  const options = Object.assign(
    {},
    defaultOptions,
    require(filename).options || {},
  )

  const results = await bench(filename, options)

  const stats = {}
  stats.start = start
  stats.end = performance.now()
  stats.avg =
    results.reduce((total, current) => total + current) / results.length
  stats.stddev = Math.sqrt(
    results
      .map(entry => entry - stats.avg)
      .map(diff => Math.pow(diff, 2))
      .reduce((total, current) => total + current) / results.length,
  )
  stats.max = Math.max(...results)
  stats.min = Math.min(...results)
  stats.totalTime = stats.end - stats.start

  console.log(`\
avg:           ${stats.avg.toFixed(3)}ms
stddev:        ${stats.stddev.toFixed(3)}ms
max:           ${stats.max.toFixed(3)}ms
min:           ${stats.min.toFixed(3)}ms
total time:    ${(stats.totalTime / 1000).toFixed(2)}s`)
})()
