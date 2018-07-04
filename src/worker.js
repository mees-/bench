const { parentPort, workerData } = require('worker_threads')

function convertHrtime([seconds, nanoseconds]) {
  return seconds * 1000 + nanoseconds / 1e6
}

const subject = require(workerData.filename)
;(async () => {
  const context = (subject.createContext && subject.createContext()) || {}

  const entries = []
  workerData.beforeBench && workerData.beforeBench(context)

  for (let i = 0; i < workerData.runs; i++) {
    subject.beforeRun && subject.beforeRun(context)
    const runStart = process.hrtime()

    for (let j = 0; j < workerData.loops; j++) {
      await subject.benchmarkFunction(context)
    }

    const runTime = convertHrtime(process.hrtime(runStart))
    entries.push(runTime)
    subject.afterRun && subject.afterRun(context)
    if (workerData.progressive && i % Math.trunc(workerData.runs / 100) === 0) {
      parentPort.postMessage({
        partialEntries: entries.slice(i - 10),
      })
    }
  }

  subject.afterBench && subject.afterBench(context)

  if (!workerData.progressive) {
    parentPort.postMessage({ entries })
  }

  parentPort.unref()
})()
