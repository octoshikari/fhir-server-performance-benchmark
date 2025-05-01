import fs from 'fs/promises'
import { instantQuery } from './metrics.js'

async function renderReportToHtml(jsonFilePath) {
  try {
    // Read and parse the JSON file
    const jsonData = JSON.parse(await fs.readFile(jsonFilePath, 'utf-8'))

    // Extract data
    const rpsData = jsonData.crud.average_rps.data.result
    const p99Data = jsonData.crud.average_crud_p99.data.result

    // Extract unique fhirimpl values
    const fhirimpls = [...new Set(rpsData.map(item => item.metric.fhirimpl))]

    // Create data maps for easy lookup
    const rpsMap = new Map()
    rpsData.forEach(item => {
      rpsMap.set(item.metric.fhirimpl, parseFloat(item.value[1]).toFixed(2))
    })

    // Helper function to calculate average for an array of values
    const calculateAverage = (values) => {
      if (!values || values.length === 0) return null
      const numValues = values.filter(v => v !== null && v !== undefined && !isNaN(v))
      if (numValues.length === 0) return null
      const sum = numValues.reduce((acc, val) => acc + parseFloat(val), 0)
      return (sum / numValues.length).toFixed(1)
    }

    // Helper function to get all values for a method and implementation
    const getMethodImplValues = (method, impl) => {
      const values = []
      const methodMap = p99Map.get(impl)?.get(method)
      if (methodMap) {
        resources.forEach(resource => {
          const value = methodMap.get(resource)
          if (value) values.push(parseFloat(value))
        })
      }
      return values
    }

    // Create p99 data structure
    const p99Map = new Map()
    p99Data.forEach(item => {
      const impl = item.metric.fhirimpl
      const method = item.metric.method
      // Handle both formats: 'Resource/?' and '${}/Resource'
      const resource = item.metric.name.includes('${}/')
        ? item.metric.name.split('/')[1]
        : item.metric.name.split('/')[0]

      if (!p99Map.has(impl)) {
        p99Map.set(impl, new Map())
      }
      if (!p99Map.get(impl).has(method)) {
        p99Map.get(impl).set(method, new Map())
      }
      // Convert seconds to milliseconds
      const valueInMs = (parseFloat(item.value[1]) * 1000).toFixed(1)
      p99Map.get(impl).get(method).set(resource, valueInMs)
    })

    // Get unique methods and resources
    const methods = [...new Set(p99Data.map(item => item.metric.method))].sort()
    const resources = [...new Set(p99Data.map(item => {
      const name = item.metric.name
      return name.includes('${}/') ? name.split('/')[1] : name.split('/')[0]
    }))].sort()

    // Helper function to get cell color based on value comparison
    const getCellStyle = (values, currentValue) => {
      if (!currentValue || values.length === 0) return ''
      const numValues = values.map(v => parseFloat(v))
      const currentNum = parseFloat(currentValue)
      const min = Math.min(...numValues)
      const max = Math.max(...numValues)

      if (currentNum === min) return 'text-green-600 font-semibold'
      if (currentNum === max) return 'text-red-600 font-semibold'
      return 'text-gray-500'
    }

    // Generate HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>FHIR Server Performance Results</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        .group-header {
            background-color: #f8fafc
            position: sticky
            top: 48px
            z-index: 9
        }
        .metric-header {
            background-color: #f1f5f9
            position: sticky
            top: 96px
            z-index: 8
        }
        .sticky-header {
            position: sticky
            top: 0
            z-index: 10
            background-color: #f9fafb
        }
        .table-container {
            max-height: calc(100vh - 200px)
            overflow-y: auto
            background: white
            border-radius: 8px
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
        }
        .table-container::-webkit-scrollbar {
            width: 8px
            height: 8px
        }
        .table-container::-webkit-scrollbar-track {
            background: #f1f1f1
            border-radius: 4px
        }
        .table-container::-webkit-scrollbar-thumb {
            background: #888
            border-radius: 4px
        }
        .table-container::-webkit-scrollbar-thumb:hover {
            background: #666
        }
        thead th {
            background-color: #f9fafb
        }
        .sticky-group {
            position: sticky
            top: 48px
            z-index: 9
            background-color: #f8fafc
        }
        .sticky-metric {
            position: sticky
            top: 96px
            z-index: 8
            background-color: #f1f5f9
        }
        .method-content {
            transition: all 0.3s ease-in-out
        }
        .method-content.collapsed {
            display: none
        }
        .toggle-icon {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)
            display: inline-flex
            align-items: center
            justify-content: center
            width: 20px
            height: 20px
            margin-right: 8px
            border-radius: 4px
        }
        .toggle-icon svg {
            width: 16px
            height: 16px
            stroke: #64748b
            stroke-width: 2
            transition: stroke 0.2s ease
        }
        .method-row:hover .toggle-icon {
            background-color: #e2e8f0
        }
        .method-row:hover .toggle-icon svg {
            stroke: #334155
        }
        .toggle-icon.collapsed {
            transform: rotate(-90deg)
        }
        .method-row {
            cursor: pointer
        }
        .method-row:hover {
            background-color: #f8fafc
        }
        .method-row:hover .method-name {
            color: #334155
        }
        .method-name {
            transition: color 0.2s ease
        }
        .metric-col {
            width: 400px
            min-width: 400px
            max-width: 400px
        }
        .impl-col {
            width: 160px
            min-width: 160px
            max-width: 160px
        }
        table {
            table-layout: fixed
        }
    </style>
    <script>
        function toggleMethod(methodId, event) {
            // Prevent event from bubbling up to parent elements
            event.stopPropagation()

            const content = document.getElementById('content-' + methodId)
            const icon = document.getElementById('icon-' + methodId)
            const row = document.getElementById('row-' + methodId)

            content.classList.toggle('collapsed')
            icon.classList.toggle('collapsed')

            // Save state to localStorage
            const isCollapsed = content.classList.contains('collapsed')
            localStorage.setItem('method-' + methodId, isCollapsed)
        }

        function toggleAllMethods(collapse) {
            const methodRows = document.querySelectorAll('[id^="row-"]')
            methodRows.forEach(row => {
                const methodId = row.id.replace('row-', '')
                const content = document.getElementById('content-' + methodId)
                const icon = document.getElementById('icon-' + methodId)

                if (collapse) {
                    content.classList.add('collapsed')
                    icon.classList.add('collapsed')
                } else {
                    content.classList.remove('collapsed')
                    icon.classList.remove('collapsed')
                }

                localStorage.setItem('method-' + methodId, collapse)
            })
        }

        // Initialize collapse states on page load
        document.addEventListener('DOMContentLoaded', () => {
            // Check if this is the first visit
            const hasVisited = localStorage.getItem('has-visited')

            if (!hasVisited) {
                // First visit - collapse all
                toggleAllMethods(true)
                localStorage.setItem('has-visited', 'true')
            } else {
                // Subsequent visits - restore saved states
                const methodRows = document.querySelectorAll('[id^="row-"]')
                methodRows.forEach(row => {
                    const methodId = row.id.replace('row-', '')
                    const content = document.getElementById('content-' + methodId)
                    const icon = document.getElementById('icon-' + methodId)

                    const isCollapsed = localStorage.getItem('method-' + methodId) === 'true'
                    if (isCollapsed) {
                        content.classList.add('collapsed')
                        icon.classList.add('collapsed')
                    }
                })
            }
        })
    </script>
</head>
<body class="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-['Inter']">
    <div class="max-w-[1080px] mx-auto">
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="px-6 py-5 bg-white flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-900">FHIR Server Performance Results</h2>
                <div class="space-x-2">
                    <button onclick="toggleAllMethods(true)" class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-md">Collapse All</button>
                    <button onclick="toggleAllMethods(false)" class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-md">Expand All</button>
                </div>
            </div>
            <div class="table-container">
                <table class="min-w-full">
                    <thead class="sticky-header">
                        <tr>
                            <th scope="col" class="metric-col px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                Metric
                            </th>
                            ${fhirimpls.map(impl => `
                                <th scope="col" class="impl-col px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                    ${impl}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody class="bg-white">
                        <!-- CRUD Operations Group -->
                        <tr>
                            <td colspan="${fhirimpls.length + 1}" class="sticky-group px-6 py-4 text-sm font-semibold text-gray-900">
                                CRUD Operations
                            </td>
                        </tr>

                        <!-- Average RPS -->
                        <tr>
                            <td colspan="${fhirimpls.length + 1}" class="sticky-metric px-6 py-3 text-sm font-medium text-gray-700">
                                Average Requests/Second
                            </td>
                        </tr>
                        <tr>
                            <td class="metric-col pl-6 px-6 py-4 text-sm text-gray-500">
                                Total RPS
                            </td>
                            ${fhirimpls.map(impl => {
                              const value = rpsMap.get(impl)
                              return `
                                    <td class="impl-col px-6 py-4 text-right text-sm ${
                                        parseFloat(value) > 1000 ? 'text-green-600 font-semibold' : 'text-gray-500'
                                    }">
                                        ${value || '-'}
                                    </td>
                                `
                            }).join('')}
                        </tr>

                        <!-- P99 Latency by Method -->
                        <tr>
                            <td colspan="${fhirimpls.length + 1}" class="sticky-metric px-6 py-3 text-sm font-medium text-gray-700">
                                P99 Latency (milliseconds)
                            </td>
                        </tr>
                        ${methods.map((method, index) => {
                          // Calculate averages for each implementation
                          const implAverages = fhirimpls.map(impl => {
                            const values = getMethodImplValues(method, impl)
                            return calculateAverage(values)
                          })

                          return `
                            <tr id="row-${method}" class="method-row hover:bg-gray-50" onclick="toggleMethod('${method}', event)">
                                <td class="metric-col pl-6 px-6 py-3 text-sm font-medium text-gray-900 flex items-center">
                                    <span id="icon-${method}" class="toggle-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                    <span class="method-name">${method}</span>
                                </td>
                                ${fhirimpls.map((impl, i) => {
                                  const average = implAverages[i]
                                  return `
                                        <td class="impl-col px-6 py-3 text-right text-sm ${average ? getCellStyle(implAverages.filter(Boolean), average) : 'text-gray-500'}">
                                            ${average || '-'}
                                        </td>
                                    `
                                }).join('')}
                            </tr>
                            <tr>
                                <td colspan="${fhirimpls.length + 1}" class="p-0">
                                    <div id="content-${method}" class="method-content">
                                        <table class="min-w-full">
                                            ${resources.map(resource => {
                                              const rowValues = fhirimpls.map(impl =>
                                                p99Map.get(impl)?.get(method)?.get(resource)
                                              ).filter(Boolean)

                                              return `
                                                    <tr class="hover:bg-gray-50">
                                                        <td class="metric-col pl-12 px-6 py-2 text-sm text-gray-500">
                                                            ${resource}
                                                        </td>
                                                        ${fhirimpls.map(impl => {
                                                          const value = p99Map.get(impl)?.get(method)?.get(resource)
                                                          return `
                                                                <td class="impl-col px-6 py-2 text-right text-sm ${getCellStyle(rowValues, value)}">
                                                                    ${value || '-'}
                                                                </td>
                                                            `
                                                        }).join('')}
                                                    </tr>
                                                `
                                            }).join('')}
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="mt-4 text-center text-sm text-gray-500">
            Generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`

    // Generate output filename
    const htmlFilePath = jsonFilePath.replace('.json', '.html')

    // Write HTML file
    await Bun.write(Bun.file(htmlFilePath), html)
    console.log(`HTML report generated: ${htmlFilePath}`)

    return html
  } catch (error) {
    console.error('Error rendering HTML:', error)
    throw error
  }
}

function generateQueries(runid) {
  return {
    crud: {
      average_rps: {
        query: `sum by (fhirimpl, scenario) (avg_over_time(irate(k6_http_reqs_total{runid="${runid}", scenario="crud"}[1m])[24h:]))`,
      },
      average_crud_p99: {
        query: `sum by (fhirimpl, method, name) (avg_over_time(k6_http_req_duration_p99{runid="${runid}", scenario="crud"}[24h:]))`,
      }
    }
  }
}

export default async function (runid) {
  const queries = generateQueries(runid)
  const reportData = {}

  for (const [scenario, metrics] of Object.entries(queries)) {
    reportData[scenario] = {}
    for (const [metric, query] of Object.entries(metrics)) {
      reportData[scenario][metric] = await instantQuery(query.query)
    }
  }

  const outputFile = `reports/${runid}.json`
  await Bun.write(Bun.file(outputFile), JSON.stringify(reportData, null, 2))
  await renderReportToHtml(outputFile)
}
