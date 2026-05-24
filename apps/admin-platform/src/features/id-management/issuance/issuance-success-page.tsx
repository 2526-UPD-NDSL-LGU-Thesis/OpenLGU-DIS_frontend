import { useEffect, useState } from "react"
import type { ReactNode } from "react"

import { IdPreviewSuccessPage } from "#/features/id-management/id-preview/IdPreviewSuccessPage"
import type { IssuanceSuccessData } from "./issuance-success-store"

const LEAVE_WARNING_MESSAGE = "Leaving this page will lose the current printable PDF preview."

export function IssuanceSuccessPage({ data }: { data: IssuanceSuccessData }) {
  const [warnOnLeave, setWarnOnLeave] = useState(true)

  useEffect(() => {
    if (!warnOnLeave) {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = LEAVE_WARNING_MESSAGE
      return LEAVE_WARNING_MESSAGE
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [warnOnLeave])

  const details: ReactNode = (
    <>
      <p className="text-sm text-muted-foreground">
        Assigned UIN: <span className="font-medium text-foreground">{data.uin}</span>
      </p>
      {data.pcn ? (
        <p className="mt-1 text-sm text-muted-foreground">
          PCN: <span className="font-medium text-foreground">{data.pcn}</span>
        </p>
      ) : null}
      <div className="mt-1 text-sm text-muted-foreground">
        QR: <span className="font-medium text-foreground">{data.qr}</span>
      </div>
    </>
  )

  return (
    <IdPreviewSuccessPage
      data={data.preview}
      title="Issuance complete"
      details={details}
      autoOpenPrintOnMount
      onBackToDashboardClick={(event) => {
        if (!warnOnLeave) {
          return
        }

        const confirmed = window.confirm(LEAVE_WARNING_MESSAGE)
        if (!confirmed) {
          event.preventDefault()
          return
        }

        setWarnOnLeave(false)
      }}
    />
  )
}

