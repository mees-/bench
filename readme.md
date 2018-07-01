# Bench

> a benchmarking framework for **Node.js** that uses the new `worker_threads` module to speed up benchmarks

## Installation

install locally or globally by using

```bash
npm install @mees-/bench
```

with an optional `-g` option to install globally  
the package exposes a bin that can be used from the command line and in npm scripts

## Usage

```
  $ bench <filename> [options]

Options
  --runs, -r                      the amount of runs of loops to do, default: 1000
  --loops, -l                     the amount of loops to do every run, default: 50
  --maxThreads, -m                the maximum amount of threads to spawn, this defaults to the amount of cores
  --no--hyperthreading, --no-h    without this the maxthreads will be halved to avoid hyperthreading, unless you set maxthreads manually

Examples
  $ bench src/benchmark.js -r 1000 -l 80 --no-h
  avg run:        185.570ms
  avg loop:       927.852µs
  stddev:         8.881ms
  max:            221.112ms
  min:            178.499ms
  total time:     2.52s
```

the file looks like this, with all keys optional except for `benchmarkFunction`

```ts
module.exports = {
  // return a context that will be passed to all other lifecycle functions
  createContext: () => any,
  beforeBench: (context) => void,
  beforeRun: (context) => void,
  benchmarkFunction: (context) => void
  afterRun: (context) => void
  afterBench: (context) => void,

  options: {
    // the amount of runs of loops to do, default: 1000
    runs: number,
    // the amount of loops to do in a run, default: 50
    loops: number,
    // the maximum amount of threads to use, defaults to amount of cores
    maxThreads: number,
    // if maxThreads isn't set, setting ht to true will divide the cores by 2 to avoid hyperthreading
    // default: true
    ht: boolean
  }
}
```

## License

MIT © [Mees van Dijk](https://github.com/mees-/bench)
