const { parentPort, workerData } = require('worker_threads')

function convertHrtime([seconds, nanoseconds]) {
  return seconds * 1000 + nanoseconds / 1e6
}

const subject = require(workerData.filename)
;(async () => {
  const context = (subject.createContext && subject.createContext()) || {}

  const entries = []
  subject.beforeBench && subject.beforeBench(context)
  for (let i = 0; i < workerData.runs; i++) {
    subject.beforeRun && subject.beforeRun(context)
    const runStart = process.hrtime()
    for (let j = 0; j < workerData.loops; j++) {
      await subject.benchmarkFunction(context)
    }
    const runTime = convertHrtime(process.hrtime(runStart))
    entries.push(runTime)
    subject.afterRun && subject.afterRun(context)
    if (workerData.progressive && i % Math.ceil(workerData.runs / 100) === 0) {
      const partialEntries = entries.slice(
        -1 * Math.ceil(workerData.runs / 100),
      )
      parentPort.postMessage({
        partialEntries,
      })
    }
  }

  subject.afterBench && subject.afterBench(context)

  parentPort.postMessage({ entries })

  parentPort.unref()
})()
