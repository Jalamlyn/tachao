import React, { useEffect, useRef, useState } from "react"
import * as echarts from "echarts"
import "echarts/extension/bmap/bmap"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { MapComponentProps, MapDataItem } from "./mapTypes"
import { DEFAULT_MAP_CONFIG, MAP_STYLES, DEFAULT_STYLE_CONFIG, DEFAULT_CONTROLS } from "./mapConfig"

// 加载百度地图API的函数
const loadBMapScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 如果已经加载过，直接返回
    if (window.BMap) {
      resolve();
      return;
    }

    // 创建script标签
    const script = document.createElement("script")
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=${apiKey}&callback=initMap`
    script.onerror = () => reject(new Error('Failed to load BMap API'))
    
    // 设置回调函数
    window.initMap = () => {
      resolve()
    }

    document.body.appendChild(script)
  })
}

const MapComponent: React.FC<MapComponentProps> = ({
  data = [],
  title,
  apiKey = "4vmZ4F78PjlmoZrabEScBjI1g4gRCY2B",
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
  containerStyle,
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [isClustering, setIsClustering] = useState(defaultClustering)
  const [currentMapStyle, setCurrentMapStyle] = useState<"normal" | "dark">("normal")
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载百度地图API
  useEffect(() => {
    const initBMap = async () => {
      try {
        setIsLoading(true)
        await loadBMapScript(apiKey)
        setIsMapReady(true)
      } catch (err) {
        setError('Failed to load BMap API')
        console.error('Error loading BMap:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initBMap()
  }, [apiKey])

  // 初始化图表
  useEffect(() => {
    if (!isMapReady || !chartRef.current) return

    try {
      chartInstance.current = echarts.init(chartRef.current)
      const option = getChartOption()
      chartInstance.current.setOption(option)
      geocodeAddresses()
    } catch (err) {
      setError('Failed to initialize chart')
      console.error('Error initializing chart:', err)
    }

    return () => {
      chartInstance.current?.dispose()
    }
  }, [isMapReady, data, isClustering, currentMapStyle, mapStyle])

  const getChartOption = () => {
    const option: echarts.EChartsOption = {
      backgroundColor: mapStyle.backgroundColor || DEFAULT_STYLE_CONFIG.backgroundColor,
      title: title
        ? {
            text: title,
            left: "center",
            textStyle: {
              color: currentMapStyle === "dark" ? "#fff" : "#333",
            },
          }
        : undefined,
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          if (tooltip?.formatter) {
            return tooltip.formatter(params.data)
          }
          if (tooltip?.fields) {
            return tooltip.fields
              .map((field) => {
                const value = params.data[field.key]
                const formattedValue = field.format ? field.format(value) : value
                return `${field.label}: ${formattedValue}`
              })
              .join("<br/>")
          }
          const { name, value } = params.data
          return `${name}<br/>数值: ${value[2]}`
        },
      },
      bmap: {
        center,
        zoom,
        roam: true,
        mapStyle: {
          styleJson: MAP_STYLES[currentMapStyle],
        },
      },
      series: [
        {
          name: "数据点",
          type: "scatter",
          coordinateSystem: "bmap",
          data: [],
          symbolSize: (val: any) => {
            const value = typeof val === "number" ? val : val[2]
            if (typeof mapStyle.symbolSize === "function") {
              return mapStyle.symbolSize(value, isClustering)
            }
            if (typeof mapStyle.symbolSize === "number") {
              return mapStyle.symbolSize
            }
            return DEFAULT_STYLE_CONFIG.symbolSize(value, isClustering)
          },
          itemStyle: {
            color: (params: any) => {
              const value = params.data.value[2]
              const values = data.map((item) => item.value)
              const maxValue = Math.max(...values)
              const minValue = Math.min(...values)

              if (typeof mapStyle.pointColor === "function") {
                return mapStyle.pointColor(value, minValue, maxValue)
              }
              if (typeof mapStyle.pointColor === "string") {
                return mapStyle.pointColor
              }
              return DEFAULT_STYLE_CONFIG.pointColor(value, minValue, maxValue)
            },
          },
          encode: {
            value: 2,
          },
          label: {
            formatter: "{b}",
            position: "right",
            show: false,
          },
          emphasis: {
            label: {
              show: true,
            },
          },
        },
      ],
    }

    return option
  }

  const geocodeAddresses = async () => {
    if (!isMapReady || !data.length || !chartInstance.current) return

    try {
      const geocoder = new (window as any).BMap.Geocoder()
      const geocodePromises = data.map(
        (item) =>
          new Promise<any>((resolve) => {
            if (item.coordinates) {
              resolve({
                name: item.name,
                value: [...item.coordinates, item.value, item],
                itemData: item,
              })
            } else {
              geocoder.getPoint(item.address, function (point: any) {
                if (point) {
                  resolve({
                    name: item.name,
                    value: [point.lng, point.lat, item.value, item],
                    itemData: item,
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
      const validResults = results.filter((result) => result !== null)

      chartInstance.current.setOption({
        series: [
          {
            data: validResults,
          },
        ],
      })

      if (onPointClick) {
        chartInstance.current.on("click", (params: any) => {
          if (params.data?.itemData) {
            onPointClick(params.data.itemData)
          }
        })
      }

      if (onViewChange) {
        const bmap = chartInstance.current.getModel().getComponent("bmap").getBMap()
        bmap.addEventListener("moveend", () => {
          const center = bmap.getCenter()
          onViewChange([center.lng, center.lat], bmap.getZoom())
        })
      }
    } catch (err) {
      setError('Failed to geocode addresses')
      console.error('Error geocoding addresses:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Icon icon="eos-icons:loading" className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm text-default-500">加载地图中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-2 text-danger">
          <Icon icon="mdi:alert-circle" className="w-8 h-8" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className || ""}`}>
      <div ref={chartRef} style={{ width: "100%", height: "400px", ...containerStyle }} />
      <div className='absolute top-2 right-2 flex gap-2'>
        {controls.clustering && (
          <Button
            size='sm'
            color={isClustering ? "primary" : "default"}
            onClick={() => setIsClustering(!isClustering)}
            startContent={<Icon icon='mdi:cluster' className='w-4 h-4' />}
          >
            {isClustering ? "取消聚合" : "聚合显示"}
          </Button>
        )}
        {controls.darkMode && enableDarkMode && (
          <Button
            size='sm'
            color={currentMapStyle === "dark" ? "primary" : "default"}
            onClick={() => setCurrentMapStyle(currentMapStyle === "normal" ? "dark" : "normal")}
            startContent={
              <Icon icon={currentMapStyle === "dark" ? "mdi:weather-night" : "mdi:weather-sunny"} className='w-4 h-4' />
            }
          >
            {currentMapStyle === "dark" ? "亮色模式" : "暗色模式"}
          </Button>
        )}
      </div>
    </div>
  )
}

export default MapComponent