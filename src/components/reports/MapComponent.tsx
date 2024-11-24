import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import 'echarts/extension/bmap/bmap'
import { Button } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { MapComponentProps, MapDataItem } from './mapTypes'
import { DEFAULT_MAP_CONFIG, MAP_STYLES, DEFAULT_STYLE_CONFIG, DEFAULT_CONTROLS } from './mapConfig'

const MapComponent: React.FC<MapComponentProps> = ({
  data = [],
  title,
  apiKey = process.env.REACT_APP_BAIDU_MAP_KEY || '4vmZ4F78PjlmoZrabEScBjI1g4gRCY2B',
  center = DEFAULT_MAP_CONFIG.center,
  zoom = DEFAULT_MAP_CONFIG.zoom,
  style: mapStyle = {},
  tooltip,
  clustering: defaultClustering = false,
  enableDarkMode = true,
  controls = DEFAULT_CONTROLS,
  onPointClick,
  onViewChange,
  className,
  containerStyle
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [isClustering, setIsClustering] = useState(defaultClustering)
  const [currentMapStyle, setCurrentMapStyle] = useState<'normal' | 'dark'>('normal')
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current)
      
      const script = document.createElement('script')
      script.src = `https://api.map.baidu.com/api?v=3.0&ak=${apiKey}&callback=initMap`
      document.body.appendChild(script)

      window.initMap = () => {
        const option = getChartOption()
        chartInstance.current?.setOption(option)
        geocodeAddresses()
      }

      return () => {
        chartInstance.current?.dispose()
        document.body.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (chartInstance.current) {
      const option = getChartOption()
      chartInstance.current.setOption(option)
      geocodeAddresses()
    }
  }, [data, isClustering, currentMapStyle, mapStyle])

  const getChartOption = () => {
    const option: echarts.EChartsOption = {
      backgroundColor: mapStyle.backgroundColor || DEFAULT_STYLE_CONFIG.backgroundColor,
      title: title ? {
        text: title,
        left: 'center',
        textStyle: {
          color: currentMapStyle === 'dark' ? '#fff' : '#333'
        }
      } : undefined,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (tooltip?.formatter) {
            return tooltip.formatter(params.data)
          }
          if (tooltip?.fields) {
            return tooltip.fields.map(field => {
              const value = params.data[field.key]
              const formattedValue = field.format ? field.format(value) : value
              return `${field.label}: ${formattedValue}`
            }).join('<br/>')
          }
          const { name, value } = params.data
          return `${name}<br/>数值: ${value[2]}`
        }
      },
      bmap: {
        center,
        zoom,
        roam: true,
        mapStyle: {
          styleJson: MAP_STYLES[currentMapStyle]
        }
      },
      series: [
        {
          name: '数据点',
          type: 'scatter',
          coordinateSystem: 'bmap',
          data: [],
          symbolSize: (val: any) => {
            const value = typeof val === 'number' ? val : val[2]
            if (typeof mapStyle.symbolSize === 'function') {
              return mapStyle.symbolSize(value, isClustering)
            }
            if (typeof mapStyle.symbolSize === 'number') {
              return mapStyle.symbolSize
            }
            return DEFAULT_STYLE_CONFIG.symbolSize(value, isClustering)
          },
          itemStyle: {
            color: (params: any) => {
              const value = params.data.value[2]
              const values = data.map(item => item.value)
              const maxValue = Math.max(...values)
              const minValue = Math.min(...values)
              
              if (typeof mapStyle.pointColor === 'function') {
                return mapStyle.pointColor(value, minValue, maxValue)
              }
              if (typeof mapStyle.pointColor === 'string') {
                return mapStyle.pointColor
              }
              return DEFAULT_STYLE_CONFIG.pointColor(value, minValue, maxValue)
            }
          },
          encode: {
            value: 2
          },
          label: {
            formatter: '{b}',
            position: 'right',
            show: false
          },
          emphasis: {
            label: {
              show: true
            }
          }
        }
      ]
    }

    return option
  }

  const geocodeAddresses = async () => {
    if (!data.length || !chartInstance.current) return

    const geocoder = new (window as any).BMap.Geocoder()
    const geocodePromises = data.map(item => 
      new Promise<any>((resolve) => {
        if (item.coordinates) {
          resolve({
            name: item.name,
            value: [...item.coordinates, item.value, item],
            itemData: item
          })
        } else {
          geocoder.getPoint(item.address, function(point: any) {
            if (point) {
              resolve({
                name: item.name,
                value: [point.lng, point.lat, item.value, item],
                itemData: item
              })
            } else {
              console.error("无法解析该地址: " + item.address)
              resolve(null)
            }
          })
        }
      })
    )

    const results = await Promise.all(geocodePromises)
    const validResults = results.filter(result => result !== null)
    
    chartInstance.current.setOption({
      series: [
        {
          data: validResults
        }
      ]
    })

    if (onPointClick) {
      chartInstance.current.on('click', (params: any) => {
        if (params.data?.itemData) {
          onPointClick(params.data.itemData)
        }
      })
    }

    if (onViewChange) {
      const bmap = chartInstance.current.getModel().getComponent('bmap').getBMap()
      bmap.addEventListener('moveend', () => {
        const center = bmap.getCenter()
        onViewChange([center.lng, center.lat], bmap.getZoom())
      })
    }
  }

  return (
    <div className={`relative ${className || ''}`}>
      <div ref={chartRef} style={{ width: '100%', height: '400px', ...containerStyle }} />
      <div className="absolute top-2 right-2 flex gap-2">
        {controls.clustering && (
          <Button
            size="sm"
            color={isClustering ? "primary" : "default"}
            onClick={() => setIsClustering(!isClustering)}
            startContent={<Icon icon="mdi:cluster" className="w-4 h-4" />}
          >
            {isClustering ? '取消聚合' : '聚合显示'}
          </Button>
        )}
        {controls.darkMode && enableDarkMode && (
          <Button
            size="sm"
            color={currentMapStyle === 'dark' ? "primary" : "default"}
            onClick={() => setCurrentMapStyle(currentMapStyle === 'normal' ? 'dark' : 'normal')}
            startContent={<Icon icon={currentMapStyle === 'dark' ? "mdi:weather-night" : "mdi:weather-sunny"} className="w-4 h-4" />}
          >
            {currentMapStyle === 'dark' ? '亮色模式' : '暗色模式'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default MapComponent