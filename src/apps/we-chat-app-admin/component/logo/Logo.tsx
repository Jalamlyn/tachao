import { Link } from "@nextui-org/link"
import logo from "./logo.png"

export default ({ size = 66, color = "text-white", text = "", href = "/" }) => {
  return (
    <>
      <img height={size} width={size} className={`rounded-lg mr-1`} src={logo} alt='logo' />
    </>
  )
}
