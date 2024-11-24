// 默认地图配置
export const DEFAULT_MAP_CONFIG = {
  center: [104.114129, 37.550339] as [number, number],
  zoom: 5,
  minZoom: 2,
  maxZoom: 18
}

// 地图样式配置
export const MAP_STYLES = {
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
  ],
  satellite: []
}

// 默认样式配置
export const DEFAULT_STYLE_CONFIG = {
  backgroundColor: 'transparent',
  pointColor: (value: number, min: number, max: number) => {
    const normalizedValue = (value - min) / (max - min)
    return `rgba(255, 0, 0, ${0.2 + normalizedValue * 0.8})`
  },
  symbolSize: (value: number, clustering: boolean) => {
    return clustering ? Math.sqrt(value) * 3 : Math.sqrt(value) * 5
  }
}

// 默认控件配置
export const DEFAULT_CONTROLS = {
  clustering: true,
  darkMode: true,
  zoom: true
}