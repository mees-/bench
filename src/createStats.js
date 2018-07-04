const { performance } = require('perf_hooks')

module.exports = function createStats(entries, { start, runs, loops }) {
  start = start
  end = performance.now()
  avgRun = entries.reduce((total, current) => total + current) / entries.length
  avgLoop = avgRun / loops
  stddev = Math.sqrt(
    entries
      .map(entry => entry - avgRun)
      .map(diff => Math.pow(diff, 2))
      .reduce((total, current) => total + current) / entries.length,
  )
  max = Math.max(...entries)
  min = Math.min(...entries)
  totalentries = entries.length
  totalTime = end - start
  progress = entries.length / runs

  return {
    start,
    end,
    avgRun,
    avgLoop,
    stddev,
    max,
    min,
    totalentries,
    totalTime,
    progress,
  }
}
