import doReport from './report.js'
import doSnapshot from './snapshot.js'

const lastRun = await Bun.file('last-run.json').json()

Promise.all([
  doReport(lastRun.runid),
  doSnapshot(lastRun),
]).catch(err => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
