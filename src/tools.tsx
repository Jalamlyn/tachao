import { create } from "@wpm-js/core"

create({
  name: "Tools",
  exports: {
    downloadTemplate: async (resolve) => {
      setTimeout(() => {
        resolve("项目下载成功")
      }, 5000)
    },
  },
})
