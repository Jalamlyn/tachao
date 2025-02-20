import { context } from "@/lib/context"

const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
  AMapLoader,
} = context

const { Card, CardBody, Button, Spinner } = NextUI

const ActivityMap = observer(({ activities, onSelectActivity }) => {
  const [map, setMap] = React.useState(null)
  const [markers, setMarkers] = React.useState([])
  const [infoWindow, setInfoWindow] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const mapRef = React.useRef(null)

  React.useEffect(() => {
    // 配置安全密钥
    window._AMapSecurityConfig = {
      securityJsCode: "3ed51ac112185741859b995f9a321950",
    }

    // 加载高德地图
    const loadMap = async () => {
      try {
        api.log.info("开始加载高德地图")

        const AMap = await AMapLoader.load({
          key: "8970f81f28e27b497450c141a942a4e2",
          version: "2.0",
          plugins: ["AMap.Scale", "AMap.ToolBar"],
        })

        const mapInstance = new AMap.Map(mapRef.current, {
          viewMode: "3D",
          zoom: 11,
          center: [116.397428, 39.90923],
        })

        // 添加控件
        mapInstance.addControl(new AMap.Scale())
        mapInstance.addControl(new AMap.ToolBar())

        setMap(mapInstance)
        setLoading(false)

        api.log.info("高德地图加载成功")
      } catch (error) {
        api.log.error("高德地图加载失败", {
          error: error.message,
        })
        setError("地图加载失败，请刷新重试")
        setLoading(false)
      }
    }

    loadMap()

    // 清理函数
    return () => {
      if (map) {
        markers.forEach((marker) => marker.remove())
        map.destroy()
        api.log.info("地图实例已销毁")
      }
    }
  }, [])

  // 更新标记点
  React.useEffect(() => {
    if (!map || !activities?.length) return

    try {
      // 清除现有标记
      markers.forEach((marker) => marker.remove())

      const newMarkers = activities.map((activity) => {
        const marker = new window.AMap.Marker({
          position: [activity.location.longitude, activity.location.latitude],
          title: activity.title,
          clickable: true,
        })

        marker.on("click", () => {
          if (infoWindow) {
            infoWindow.close()
          }

          const info = new window.AMap.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-bold">${activity.title}</h3>
                <p class="text-sm">开始时间: ${activity.startTime}</p>
                <p class="text-sm">参与人数: ${activity.participants}/${activity.maxParticipants}</p>
              </div>
            `,
            offset: new window.AMap.Pixel(0, -30),
          })

          info.open(map, marker.getPosition())
          setInfoWindow(info)
          onSelectActivity(activity.id)
        })

        marker.setMap(map)
        return marker
      })

      setMarkers(newMarkers)

      // 调整地图视野以包含所有标记
      if (newMarkers.length > 0) {
        map.setFitView()
      }

      api.log.info("地图标记点更新成功", {
        markersCount: newMarkers.length,
      })
    } catch (error) {
      api.log.error("更新地图标记点失败", {
        error: error.message,
      })
      setError("更新地图标记失败")
    }
  }, [map, activities, onSelectActivity])

  if (error) {
    return (
      <Card>
        <CardBody className='flex flex-col items-center justify-center p-8'>
          <Icon icon='solar:danger-triangle-bold' className='w-12 h-12 text-danger mb-4' />
          <p className='text-danger mb-4'>{error}</p>
          <Button color='primary' variant='flat' onPress={() => window.location.reload()}>
            重试
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className='w-full overflow-hidden'>
      <CardBody className='p-0 relative'>
        {loading && (
          <div className='absolute inset-0 flex items-center justify-center bg-background/80 z-10'>
            <Spinner label='加载地图中...' />
          </div>
        )}
        <div ref={mapRef} className='w-full h-[600px] rounded-xl' />
      </CardBody>
    </Card>
  )
})

context.wpm.export("comp_activity_map", ActivityMap)
ActivityMap.displayName = "ActivityMap"
