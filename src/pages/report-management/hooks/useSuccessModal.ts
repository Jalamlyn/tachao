import { useState } from "react"
import { useNavigate } from "react-router-dom"

export function useSuccessModal() {
  const navigate = useNavigate()
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [savedReportId, setSavedReportId] = useState<string | null>(null)

  const handleViewReport = () => {
    if (savedReportId) {
      window.open(`/report/${savedReportId}`, "_blank")
    }
  }

  const handleGoToReports = () => {
    navigate("/we-chat-app/admin/reports")
  }

  return {
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    savedReportId,
    setSavedReportId,
    handleViewReport,
    handleGoToReports,
  }
}