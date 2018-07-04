const Pool = require('worker-threads-pool')
const os = require('os')
const path = require('path')
const Cancelp = require('cancelp')

module.exports = async function bench(filename, options = {}, cb) {
  const maxThreads =
    options.maxThreads ||
    (options.hyperthreading ? os.cpus().length / 2 : os.cpus().length)
  const pool = new Pool({ max: maxThreads })
  const entries = []

  const resultPromise = new Cancelp(() => {})
  let workers = 0
  const progressive = typeof cb === 'function'
  while (pool.size < maxThreads) {
    pool.acquire(
      path.resolve(__dirname, './worker.js'),
      {
        workerData: {
          runs: options.runs / maxThreads,
          loops: options.loops,
          filename,
          progressive,
        },
      },
      res => {
        if (res instanceof Error) {
          console.error('err', err)
        } else {
          workers++
          res.on('message', val => {
            if (progressive) {
              entries.push(...val.partialEntries)
              try {
                cb({
                  completion: entries.length / (options.runs * options.loops),
                  partialEntries: val.partialEntries,
                })
              } catch {}
            } else {
              entries.push(...val.entries)
            }
          })
          res.on('error', err => {
            console.error('error in worker', err)
          })
          res.on('exit', () => {
            if (--workers === 0 && pool._queue.length === 0) {
              resultPromise.cancelResolve(entries)
            }
          })
        }
      },
    )
  }

  return resultPromise
}
