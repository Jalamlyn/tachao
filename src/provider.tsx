// 前面的 imports 保持不变
const LogoAnimation = () => {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.h1 
        className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        即想 AI
      </motion.h1>
      <motion.p
        className="text-xl text-indigo-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        随时随地实现你的想法
      </motion.p>
    </div>
  )
}
// 其余代码保持不变