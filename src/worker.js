const { parentPort, workerData } = require('worker_threads')
const { PerformanceObserver, performance } = require('perf_hooks')

const subject = require(workerData.filename)
;(async () => {
  const context = (subject.createContext && subject.createContext()) || {}

  const performanceEntries = []
  const observer = new PerformanceObserver(list => {
    performanceEntries.push(...list.getEntries().map(entry => entry.duration))
  })
  observer.observe({ entryTypes: ['measure'] })
  workerData.beforeBench && workerData.beforeBench(context)

  for (let i = 0; i < workerData.runs; i++) {
    subject.beforeRun && subject.beforeRun(context)
    performance.mark(`run-${i}-start`)

    for (let j = 0; j < workerData.loops; j++) {
      await subject.benchmarkFunction(context)
    }

    performance.mark(`run-${i}-end`)
    performance.measure(`run-${i}`, `run-${i}-start`, `run-${i}-end`)
    performance.clearMarks()
    subject.afterRun && subject.afterRun(context)
  }

  subject.afterBench && subject.afterBench(context)
  observer.disconnect()

  parentPort.postMessage({ performanceEntries })
  parentPort.unref()
})()
