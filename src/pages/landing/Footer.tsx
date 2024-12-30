import React from "react"
import { Link } from "@nextui-org/react"
import { Icon } from "@iconify/react"

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#19073B] py-12 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/assets/logo.jpg" alt="IdeaNow AI" className="w-[100px] h-auto rounded-lg" />
              <div className="flex flex-col">
                <span className="text-white font-bold">即想智能</span>
                <span className="text-white/70 text-sm">AI驱动的企业管理平台</span>
              </div>
            </div>
            <p className="text-white/70">企业应用开发成本直降80%</p>
            <div className="flex space-x-4">
              {[
                { icon: "mdi:github", link: "#" },
                { icon: "mdi:twitter", link: "#" },
                { icon: "simple-icons:wechat", link: "#" },
              ].map((social, index) => (
                <Link
                  key={index}
                  href={social.link}
                  className="text-white/70 hover:text-cyan-400 transition-colors"
                >
                  <Icon icon={social.icon} className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Icon icon="solar:widget-bold-duotone" className="text-cyan-400" />
              产品
            </h3>
            <ul className="space-y-2">
              {[
                { text: "AI 开发表单", icon: "solar:form-bold-duotone" },
                { text: "AI 开发报表", icon: "solar:chart-bold-duotone" },
                { text: "AI 开发应用", icon: "solar:widget-bold-duotone" },
                { text: "AI 分析数据", icon: "solar:chart-2-bold-duotone" },
              ].map((item) => (
                <li key={item.text}>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-cyan-400 transition-colors flex items-center gap-2"
                  >
                    <Icon icon={item.icon} className="w-4 h-4" />
                    {item.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Icon icon="solar:phone-bold-duotone" className="text-cyan-400" />
              联系方式
            </h3>
            <ul className="space-y-2">
              <li className="text-white/70 flex items-center gap-2">
                <Icon icon="solar:letter-bold-duotone" className="w-4 h-4" />
                邮箱：shihong@mobenai.com.cn
              </li>
              <li className="text-white/70 flex items-center gap-2">
                <Icon icon="solar:map-point-bold-duotone" className="w-4 h-4" />
                地址：杭州市临平区
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Icon icon="solar:shield-user-bold-duotone" className="text-cyan-400" />
              资质认证
            </h3>
            <div className="space-y-2">
              <img
                src="/assets/logo.jpg"
                alt="认证标识"
                className="w-24 h-auto rounded-lg border border-white/10"
              />
              <p className="text-white/70 text-sm">高新技术企业认证</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/70 text-sm">
              © {currentYear} 模本(杭州)科技有限责任公司. 保留所有权利.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {["隐私政策", "服务条款"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-white/70 hover:text-cyan-400 transition-colors text-sm flex items-center gap-1"
                >
                  <Icon icon="solar:document-bold-duotone" className="w-4 h-4" />
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div className="text-center mt-4">
            <Link
              href="https://beian.miit.gov.cn/#/Integrated/recordQuery"
              target="_blank"
              className="text-white/50 hover:text-cyan-400 transition-colors text-sm flex items-center justify-center gap-1"
            >
              <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4" />
              浙ICP备2024090629号-1
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer