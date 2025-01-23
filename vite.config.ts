import tsconfigPaths from "vite-tsconfig-paths"
import path from "path"
import react from "@vitejs/plugin-react-swc"
import million from "million/compiler"
import { defineConfig } from "vite"
import mdPlugin, { Mode } from "vite-plugin-markdown"
import { visualizer } from "rollup-plugin-visualizer"

export default defineConfig({
  define: {
    __API_BASE_URL__: JSON.stringify(
      process.env.DEPLOY_ENV === "us"
        ? "https://1259692580-b9dznk0gp5.na-siliconvalley.tencentscf.com/api"
        : process.env.NODE_ENV === "production"
        ? "/api"
        : "/dev"
    ),
  },
  plugins: [
    million.vite({ auto: true }),
    react(),
    tsconfigPaths(),
    mdPlugin.default({ mode: [Mode.MARKDOWN] }),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
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
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev/, ""),
        autoRewrite: true,
      },
    },
  },
})