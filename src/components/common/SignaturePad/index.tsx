import React, { useRef, useEffect, useState } from "react"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"

interface SignaturePadProps {
  width?: number | string
  height?: number
  lineWidth?: number
  lineColor?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  width = "100%",
  height = 200,
  lineWidth = 2,
  lineColor = "#000000",
  value,
  onChange,
  disabled,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    context.lineWidth = lineWidth
    context.strokeStyle = lineColor
    context.lineCap = "round"
    context.lineJoin = "round"
    setCtx(context)

    // 如果有初始值,绘制初始图像
    if (value) {
      const img = new Image()
      img.onload = () => {
        context.drawImage(img, 0, 0)
      }
      img.src = value
    }
  }, [lineWidth, lineColor, value])

  // 处理鼠标事件
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    setIsDrawing(true)
    const point = getPoint(e)
    ctx?.beginPath()
    ctx?.moveTo(point.x, point.y)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || disabled) return
    const point = getPoint(e)
    ctx?.lineTo(point.x, point.y)
    ctx?.stroke()
  }

  const handleMouseUp = () => {
    if (disabled) return
    setIsDrawing(false)
    if (onChange) {
      const dataUrl = canvasRef.current?.toDataURL()
      onChange(dataUrl || "")
    }
  }

  // 处理触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    if (disabled) return
    setIsDrawing(true)
    const point = getPoint(e.touches[0])
    ctx?.beginPath()
    ctx?.moveTo(point.x, point.y)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing || disabled) return
    const point = getPoint(e.touches[0])
    ctx?.lineTo(point.x, point.y)
    ctx?.stroke()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    if (disabled) return
    setIsDrawing(false)
    if (onChange) {
      const dataUrl = canvasRef.current?.toDataURL()
      onChange(dataUrl || "")
    }
  }

  // 获取坐标点
  const getPoint = (event: Touch | MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    }
  }

  // 清除画布
  const clear = () => {
    if (disabled) return
    const canvas = canvasRef.current
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onChange?.("")
  }

  // 调整画布大小
  const resizeCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas || !ctx) return

    const container = canvas.parentElement
    if (!container) return

    const { width: containerWidth } = container.getBoundingClientRect()
    const devicePixelRatio = window.devicePixelRatio || 1

    // 保存当前内容
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext("2d")
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0)
    }

    // 调整画布大小
    const newWidth = typeof width === "number" ? width : containerWidth
    canvas.width = newWidth * devicePixelRatio
    canvas.height = height * devicePixelRatio
    canvas.style.width = `${newWidth}px`
    canvas.style.height = `${height}px`

    // 恢复画布设置
    ctx.scale(devicePixelRatio, devicePixelRatio)
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = lineColor
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // 恢复内容
    ctx.drawImage(tempCanvas, 0, 0)
  }

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener("resize", handleResize)
    resizeCanvas() // 初始化大小

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [width, height])

  return (
    <div className={cn("signature-pad relative w-full")}>
      <canvas
        ref={canvasRef}
        className={cn(
          "touch-none select-none",
          disabled ? "cursor-not-allowed" : "cursor-crosshair",
          "border rounded-lg w-full"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      {!disabled && (
        <div className='flex justify-end gap-2 mt-2'>
          <Button
            size='sm'
            variant='light'
            color='danger'
            onClick={clear}
            startContent={<Icon icon='mdi:eraser' className='w-4 h-4' />}
          >
            清除
          </Button>
        </div>
      )}
    </div>
  )
}

export default SignaturePad
