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

run `bench [filename]` to benchmark a file

currently doens't support command-line options (yet)
you can specify the options and what to benchmark in the file that you're passing as an argument to `bench`

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
