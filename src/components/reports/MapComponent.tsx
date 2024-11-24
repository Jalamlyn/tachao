import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import 'echarts/extension/bmap/bmap';
import { Button } from '@nextui-org/react';
import { Icon } from '@iconify/react';

interface MapComponentProps {
  address?: string;
  data?: Array<{
    name: string;
    address: string;
    value: number;
    orderCount: number;
  }>;
  options?: {
    center?: [number, number];
    zoom?: number;
    style?: 'normal' | 'satellite' | 'dark';
    clustering?: boolean;
  };
  style?: React.CSSProperties;
}

const MapComponent: React.FC<MapComponentProps> = ({ address, data, options = {}, style }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isClustering, setIsClustering] = useState(options.clustering || false);
  const [mapStyle, setMapStyle] = useState(options.style || 'normal');

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);
      
      // 加载百度地图 JS API
      const script = document.createElement('script');
      script.src = `https://api.map.baidu.com/api?v=3.0&ak=4vmZ4F78PjlmoZrabEScBjI1g4gRCY2B&callback=initMap`;
      document.body.appendChild(script);

      window.initMap = () => {
        const option = getChartOption();
        chart.setOption(option);

        if (address) {
          geocodeAddress(address, chart);
        } else if (data && data.length > 0) {
          geocodeMultipleAddresses(data, chart);
        }
      };

      return () => {
        chart.dispose();
        document.body.removeChild(script);
      };
    }
  }, [address, data, isClustering, mapStyle]);

  const getChartOption = () => {
    const mapStyles: Record<string, any> = {
      normal: [
        {
          featureType: 'water',
          elementType: 'all',
          stylers: {
            color: '#d1d1d1'
          }
        },
        {
          featureType: 'land',
          elementType: 'all',
          stylers: {
            color: '#f3f3f3'
          }
        },
        {
          featureType: 'railway',
          elementType: 'all',
          stylers: {
            visibility: 'off'
          }
        },
        {
          featureType: 'highway',
          elementType: 'all',
          stylers: {
            color: '#fdfdfd'
          }
        },
        {
          featureType: 'highway',
          elementType: 'labels',
          stylers: {
            visibility: 'off'
          }
        },
        {
          featureType: 'arterial',
          elementType: 'geometry',
          stylers: {
            color: '#fefefe'
          }
        },
        {
          featureType: 'arterial',
          elementType: 'geometry.fill',
          stylers: {
            color: '#fefefe'
          }
        },
        {
          featureType: 'poi',
          elementType: 'all',
          stylers: {
            visibility: 'off'
          }
        },
        {
          featureType: 'green',
          elementType: 'all',
          stylers: {
            visibility: 'off'
          }
        },
        {
          featureType: 'subway',
          elementType: 'all',
          stylers: {
            visibility: 'off'
          }
        },
        {
          featureType: 'manmade',
          elementType: 'all',
          stylers: {
            color: '#d1d1d1'
          }
        },
        {
          featureType: 'local',
          elementType: 'all',
          stylers: {
            color: '#d1d1d1'
          }
        },
        {
          featureType: 'arterial',
          elementType: 'labels',
          stylers: {
            visibility: 'off'
          }
        },
        {
          featureType: 'boundary',
          elementType: 'all',
          stylers: {
            color: '#fefefe'
          }
        },
        {
          featureType: 'building',
          elementType: 'all',
          stylers: {
            color: '#d1d1d1'
          }
        },
        {
          featureType: 'label',
          elementType: 'labels.text.fill',
          stylers: {
            color: '#999999'
          }
        }
      ],
      satellite: [],
      dark: [
        {
          featureType: 'all',
          elementType: 'all',
          stylers: {
            color: '#1b1b1b'
          }
        },
        {
          featureType: 'water',
          elementType: 'all',
          stylers: {
            color: '#141414'
          }
        }
      ]
    };

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      title: {
        text: '委托加工厂商分布图',
        left: 'center',
        textStyle: {
          color: mapStyle === 'dark' ? '#fff' : '#333'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const { name, value } = params.data;
          return `${name}<br/>加工金额: ¥${value[2].toFixed(2)}<br/>订单数量: ${value[3]}`;
        }
      },
      bmap: {
        center: options.center || [104.114129, 37.550339],
        zoom: options.zoom || 5,
        roam: true,
        mapStyle: {
          styleJson: mapStyles[mapStyle]
        }
      },
      series: [
        {
          name: '供应商',
          type: 'scatter',
          coordinateSystem: 'bmap',
          data: [],
          symbolSize: (val: any) => {
            return isClustering ? Math.sqrt(val[3]) * 3 : Math.sqrt(val[3]) * 5;
          },
          itemStyle: {
            color: (params: any) => {
              const value = params.data.value[2];
              const maxValue = Math.max(...(data || []).map(item => item.value));
              const minValue = Math.min(...(data || []).map(item => item.value));
              const normalizedValue = (value - minValue) / (maxValue - minValue);
              return `rgba(255, 0, 0, ${0.2 + normalizedValue * 0.8})`;
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
    };

    return option;
  };

  const geocodeAddress = (address: string, chart: echarts.ECharts) => {
    const geocoder = new (window as any).BMap.Geocoder();
    geocoder.getPoint(address, function(point: any) {
      if (point) {
        chart.setOption({
          bmap: {
            center: [point.lng, point.lat],
            zoom: 12
          },
          series: [
            {
              type: 'scatter',
              coordinateSystem: 'bmap',
              data: [[point.lng, point.lat, 100, 1]],
              symbolSize: 20,
              itemStyle: {
                color: 'red'
              }
            }
          ]
        });
      } else {
        console.error("无法解析该地址: " + address);
      }
    });
  };

  const geocodeMultipleAddresses = (addresses: Array<{ name: string; address: string; value: number; orderCount: number }>, chart: echarts.ECharts) => {
    const geocoder = new (window as any).BMap.Geocoder();
    const geocodePromises = addresses.map(item => 
      new Promise((resolve) => {
        geocoder.getPoint(item.address, function(point: any) {
          if (point) {
            resolve({ name: item.name, value: [point.lng, point.lat, item.value, item.orderCount] });
          } else {
            console.error("无法解析该地址: " + item.address);
            resolve(null);
          }
        });
      })
    );

    Promise.all(geocodePromises).then((results) => {
      const validResults = results.filter(result => result !== null);
      chart.setOption({
        series: [
          {
            data: validResults
          }
        ]
      });
    });
  };

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width: '100%', height: '400px', ...style }} />
      <div className="absolute top-2 right-2 flex gap-2">
        <Button
          size="sm"
          color={isClustering ? "primary" : "default"}
          onClick={() => setIsClustering(!isClustering)}
          startContent={<Icon icon="mdi:cluster" className="w-4 h-4" />}
        >
          {isClustering ? '取消聚合' : '聚合显示'}
        </Button>
        <Button
          size="sm"
          color={mapStyle === 'dark' ? "primary" : "default"}
          onClick={() => setMapStyle(mapStyle === 'normal' ? 'dark' : 'normal')}
          startContent={<Icon icon={mapStyle === 'dark' ? "mdi:weather-night" : "mdi:weather-sunny"} className="w-4 h-4" />}
        >
          {mapStyle === 'dark' ? '亮色模式' : '暗色模式'}
        </Button>
      </div>
    </div>
  );
};

export default MapComponent;