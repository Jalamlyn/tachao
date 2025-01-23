import tsconfigPaths from "vite-tsconfig-paths"
import path from "path"
import react from "@vitejs/plugin-react-swc"
import million from "million/compiler"
import { defineConfig } from "vite"
import mdPlugin, { Mode } from "vite-plugin-markdown"
import { visualizer } from "rollup-plugin-visualizer"

export default defineConfig({
  define: {
    __API_BASE_URL__: JSON.stringify(process.env.NODE_ENV === "production" ? "https://www.mobenai.com.cn/api" : "/dev"),
  },
  plugins: [
    million.vite({ auto: true }),
    react(),
    tsconfigPaths(),
    mdPlugin.default({ mode: [Mode.MARKDOWN] }),
    visualizer({
      // emitFile: true,
      // filename: "stats.html",
      open: true, // 打包后自动打开页面
      gzipSize: true, // 查看 gzip 压缩大小
      brotliSize: true, // 查看 brotli 压缩大小
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "[name].[hash].js",
        assetFileNames: "[name].[extname]",
        manualChunks: {
          "react-vender": ["react", "react-dom"],
          "react-router-dom": ["react-router-dom"],
          "@iconify/react": ["@iconify/react"],
          "framer-motion": ["framer-motion"],
          "@nextui-org/react": ["@nextui-org/react"],
          recharts: ["recharts"],
          "react-markdown": ["react-markdown"],
          "@visactor/react-vtable": ["@visactor/react-vtable"],
          localStorage: ["localforage"],
          babel: ["@babel/standalone"],
          mermaid: ["mermaid"],
          xlsx: ["xlsx"],
          lodash: ["lodash"],
          gpt: ["gpt-tokenizer/model/gpt-4o"],
          echarts: ["echarts"],
          dateFns: ["date-fns"],
          parse5: ["parse5"],
        },
        // manualChunks(id) {
        //   // 打包依赖
        //   if (id.includes("monaco")) {
        //     return "monaco"
        //   }
        //   if (id.includes("node_modules")) {
        //     return "vendor"
        //   }
        // },
        chunkFileNames: "[name].[hash].js",
      },
    },
  },
  server: {
    hmr: false,
    port: 5174,
    proxy: {
      "/dev/": {
        target: "https://www.mobenai.com.cn/api/",
        // target: "http://106.14.47.161/api/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev/, ""),
        autoRewrite: true,
      },
    },
  },
})
