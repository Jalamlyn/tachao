export const LOCATION_PROMPTS = {
  locationPrompt: `
系统提供了以下位置服务API，你可以用它们来实现位置相关功能：

1. 位置服务API说明：
api.location = {
  // 获取当前地理位置
  getCurrentPosition: () => Promise<GeolocationPosition>,
  
  // 将坐标转换为地址
  getAddressFromLocation: (latitude: number, longitude: number) => Promise<string>,
  
  // 获取浏览器位置权限设置指南
  getBrowserPermissionGuide: () => string
}

2. 使用示例：

\`\`\`jsx
const { 
  React, 
  NextUI,
  api, 
  message 
} = context;

const { Button } = NextUI;

const LocationDemo = () => {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleGetLocation = async () => {
    try {
      setLoading(true);
      
      // 1. 获取当前位置
      const position = await api.location.getCurrentPosition();
      
      // 2. 转换为地址
      const address = await api.location.getAddressFromLocation(
        position.coords.latitude,
        position.coords.longitude
      );
      
      setAddress(address);
      message.success("位置获取成功");
      
    } catch (error) {
      // 3. 如果是权限错误，显示权限设置指南
      if(error.code === 1) {
        const guide = api.location.getBrowserPermissionGuide();
        message.error(
          <div>
            <div>请允许访问位置信息</div>
            <div className="text-xs mt-1">{guide}</div>
          </div>
        );
      } else {
        message.error("获取位置失败");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        color="primary"
        isLoading={loading}
        onPress={handleGetLocation}
      >
        获取当前位置
      </Button>
      
      {address && (
        <div className="text-sm text-gray-600">
          当前位置：{address}
        </div>
      )}
    </div>
  );
};
\`\`\`

3. 注意事项：
- 使用前需要从context中解构api对象
- 所有位置API都封装在api.location命名空间下
- getCurrentPosition 返回标准的GeolocationPosition对象
- 坐标转地址使用的是百度地图API，需要确保已加载百度地图JS
- 权限错误时建议展示getBrowserPermissionGuide的引导信息

4. 常见使用场景：
- 签到打卡
- 位置打点
- 地理围栏
- 位置记录
- 地址选择器

5. 错误处理：
- code 1: 用户拒绝位置权限
- code 2: 位置信息不可用
- code 3: 获取超时
建议针对不同错误码显示对应的提示信息

6. 最佳实践：
- 总是处理加载状态
- 优雅处理错误情况
- 提供清晰的用户反馈
- 在合适的时机提供权限设置指南`,
}
