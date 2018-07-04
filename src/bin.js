#!/usr/bin/env node --experimental-worker
const bench = require('./index.js')
const path = require('path')
const { performance } = require('perf_hooks')
const semver = require('semver')
const meow = require('meow')
const groom = require('groom')
const createStats = require('./createStats.js')
const logUpdate = require('log-update')

if (!semver.gte(process.version, '10.5.0')) {
  console.error('At least Node 10.5.0 is required, please update')
  process.exit(1)
}

const cliOptions = meow(
  `
Usage
  $ bench <filename> [options]

Options
  --runs, -r                      the amount of runs of loops to do, default: 1000
  --loops, -l                     the amount of loops to do every run, default: 50
  --maxThreads, -m                the maximum amount of threads to spawn, this defaults to the amount of cores
  --no--hyperthreading, --no-h    without this the maxthreads will be halved to avoid hyperthreading, unless you set maxthreads manually

Examples
  $ bench src/benchmark.js -r 1000 -l 80 --no-ht
  avg run:        185.570ms
  avg loop:       927.852µs
  stddev:         8.881ms
  max:            221.112ms
  min:            178.499ms
  total time:     2.52s
`,
  {
    flags: {
      runs: {
        type: 'number',
        alias: 'r',
      },
      loops: {
        type: 'number',
        alias: 'l',
      },
      maxThreads: {
        type: 'number',
        alias: 'm',
      },
      hyperthreading: {
        type: 'boolean',
        alias: 'h',
        default: true,
      },
      async: {
        type: 'boolean',
        alias: 'a',
        default: false,
      },
    },
  },
)

const defaultOptions = {
  runs: 1000,
  loops: 50,
  maxThreads: undefined,
  hyperthreading: true,
  async: false,
}

const start = performance.now()

const filename = path.resolve(cliOptions.input[0])
;(async () => {
  const options = Object.assign(
    {},
    defaultOptions,
    require(filename).options || {},
    groom({
      ...cliOptions.flags,
      h: undefined,
      l: undefined,
      r: undefined,
      m: undefined,
    }),
    { progressive: true },
  )

  if (
    typeof options.runs !== 'number' ||
    typeof options.loops !== 'number' ||
    typeof options.hyperthreading !== 'boolean'
  ) {
    console.error('options are not valid', options)
    process.exit(2)
  }

  const logStr = s => `\
proress:        ${Math.round(s.progress * 100)}%
avg run:        ${s.avgRun.toFixed(3)}ms
avg loop:       ${(s.avgLoop < 1 ? s.avgLoop * 1000 : s.avgLoop).toFixed(3)}${
    s.avgLoop < 1 ? 'µs' : 'ms'
  }
stddev:         ${s.stddev.toFixed(3)}ms
max:            ${s.max.toFixed(3)}ms
min:            ${s.min.toFixed(3)}ms
total results   ${s.totalentries}
total time:     ${(s.totalTime / 1000).toFixed(2)}s`

  const results = await bench(filename, options, ({ entries }) => {
    logUpdate.stderr(
      logStr(
        createStats(entries, {
          start,
          runs: options.runs,
          loops: options.loops,
        }),
      ),
    )
  })

  logUpdate.stderr.clear()
  const stats = createStats(results, {
    start,
    runs: options.runs,
    loops: options.loops,
  })
  console.log(logStr(stats))
})()
