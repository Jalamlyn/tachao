// 前面的 imports 保持不变，添加新的 import
import SaveContextModal from "./SaveContextModal"

// ModuleList 组件内部，在 state 声明区域添加
const [showSaveContextModal, setShowSaveContextModal] = useState(false)

// 修改 handleSaveContextShortcut 函数
const handleSaveContextShortcut = () => {
  setShowSaveContextModal(true)
}

// 在组件返回的 JSX 最后添加 SaveContextModal
return (
  <>
    {/* 原有的 JSX 内容 */}
    <SaveContextModal 
      isOpen={showSaveContextModal} 
      onClose={() => setShowSaveContextModal(false)} 
    />
  </>
)