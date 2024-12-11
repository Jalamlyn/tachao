import tsconfigPaths from "vite-tsconfig-paths"
import path from "path"
import react from "@vitejs/plugin-react-swc"
import million from "million/compiler"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import mdPlugin, { Mode } from "vite-plugin-markdown"

console.log(mdPlugin.default)
export default defineConfig({
  define: {
    __API_BASE_URL__: JSON.stringify(process.env.NODE_ENV === "production" ? "/api" : "/dev"),
  },
  plugins: [million.vite({ auto: true }), react(), tsconfigPaths(), mdPlugin.default({ mode: [Mode.MARKDOWN] })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    allowNodeBuiltins: ["pouchdb-browser", "pouchdb-utils"],
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
          "@visactor/vtable": ["@visactor/vtable"],
          "@visactor/react-vtable": ["@visactor/react-vtable"],
          babel: ["@babel/standalone"],
          mermaid: ["mermaid"],
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
