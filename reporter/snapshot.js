import { rangeQuery } from './metrics.js'

const DASHBOARD_FILE = process.env.DASHBOARD_FILE || 'dashboard.json'
const promQueryStep = '15s'

const clearDST = (x) => {
  delete x.datasource
  delete x.target
  delete x.targets
}

const interpolate = (input, re, vals) =>
  input.replace(re, (match, path) =>
    path.split('.').reduce((acc, key) => acc ? acc[key] : undefined, vals) ?? match)

const interpolate$ = (input, vals) => interpolate(input, /\$([A-Za-z0-9_]+)/g, vals)

const interpolateCB = (input, vals) => interpolate(input, /{{([^}]+)}}/g, vals)

const panelSnapshot = async (panel, runid, start, end) => {
  const promQuery = interpolate$(panel.targets[0].expr, {
    runid,
    __interval: '1m',
    __rate_interval: '1m',
  })
  const promData = await rangeQuery(promQuery, new Date(start * 1000), new Date(end * 1000), promQueryStep)

  return promData.data.result.map(row => {
    const name = interpolateCB(panel.targets[0].legendFormat, { ...row.metric })
    return {
      config: {
        displayName: name,
        displayNameFromDS: name,
      },
      fields: [
        {
          name: 'Time',
          type: 'time',
          values: row.values.map(v => 1000 * v[0]),
        },
        {
          name,
          type: 'number',
          labels: row.metric,
          values: row.values.map(v => Number.parseFloat(v[1])),
        }
      ],
      meta: {
        custom: {
          resultType: promData.data.resultType,
        },
        executedQueryString: `Expr: ${promQuery}\nStep: ${promQueryStep}`,
        preferredVisualisationType: 'graph',
        type: 'timeseries-multi',
        typeVersion: [0, 0]
      },
      name,
      refId: 'A'
    }
  })
}

export default async function ({ runid, start, end }) {
  const snapshot = await Bun.file(DASHBOARD_FILE).json()

  clearDST(snapshot.annotations.list[0])

  snapshot.__inputs = [
    {
      name: "DS_PROMETHEUS",
      label: "Prometheus",
      description: "",
      type: "datasource",
      pluginId: "prometheus",
      pluginName: "Prometheus"
    }
  ]
  snapshot.__elements = {}
  snapshot.refresh = ''

  clearDST(snapshot.templating.list[0])
  snapshot.templating.list[0].current = {}
  snapshot.templating.list[0].datasource = { type: 'prometheus', uid: '${DS_PROMETHEUS}' }
  snapshot.templating.list[0].hide = 0
  snapshot.templating.list[0].query = ""
  snapshot.templating.list[0].refresh = 1
  snapshot.templating.list[0].skipUrlSync = false

  for (const panel of snapshot.panels) {
    panel.snapshotData = await panelSnapshot(panel, runid, start, end)
    clearDST(panel)
  }

  const startAt = new Date(start * 1000).toISOString()
  const endAt = new Date(end * 1000).toISOString()

  snapshot.time = {
    from: startAt,
    raw: {
      from: startAt,
      to: endAt,
    },
    to: endAt,
  }

  snapshot.title = `Perf: snapshot ${runid}`

  await Bun.write(
    Bun.file(`snapshots/${runid}.json`),
    JSON.stringify(snapshot, null, 2))
}
