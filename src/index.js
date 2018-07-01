const Pool = require('worker-threads-pool')
const os = require('os')
const path = require('path')
const Cancelp = require('cancelp')

module.exports = async function bench(filename, options = {}) {
  const maxThreads = options.maxThreads || os.cpus().length
  const pool = new Pool({ max: maxThreads })
  const performanceEntries = []

  const resultPromise = new Cancelp(() => {})
  let workers = 0
  while (pool.size < maxThreads) {
    pool.acquire(
      path.resolve(__dirname, './worker.js'),
      {
        workerData: {
          runs: options.runs / maxThreads,
          loops: options.loops,
          filename
        }
      },
      res => {
        if (res instanceof Error) {
          console.error('err', err)
        } else {
          workers++
          res.on('message', val => {
            performanceEntries.push(...val.performanceEntries)
          })
          res.on('error', err => {
            console.log('error in worker', err)
          })
          res.on('exit', () => {
            if (--workers === 0 && pool._queue.length === 0) {
              resultPromise.cancelResolve(performanceEntries)
            }
          })
        }
      }
    )
  }

  return resultPromise
}
