export const getBrowserName = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf("Chrome") > -1) return "Chrome";
  if (userAgent.indexOf("Safari") > -1) return "Safari";
  if (userAgent.indexOf("Firefox") > -1) return "Firefox";
  if (userAgent.indexOf("Edge") > -1) return "Edge";
  return "您的浏览器";
};

export const getLocationPermissionGuide = () => {
  const browser = getBrowserName();
  switch (browser) {
    case "Chrome":
    case "Edge":
      return "请点击地址栏左侧的锁头图标，将位置信息权限设置为"允许"，然后刷新页面重试";
    case "Firefox":
      return "请点击地址栏左侧的盾牌图标，将位置信息权限设置为"允许"，然后刷新页面重试";
    case "Safari":
      return "请打开 Safari > 偏好设置 > 隐私与安全性，在位置信息设置中允许本站点访问，然后刷新页面重试";
    default:
      return "请在浏览器设置中允许网站访问位置信息，然后刷新页面重试";
  }
};