import { Badge } from "@openlguid/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@openlguid/ui/components/card"

import type {
  IdDetails,
  VerificationResult,
} from "@openlguid/ui/features/verification/types/verification"

interface ResidentProfileCardProps {
  result: VerificationResult
  profile: IdDetails
}

export function ResidentProfileCard({ result, profile }: ResidentProfileCardProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={`data:image/jpg;base64,${profile.face}`}
            alt={`${profile.full_name} face photo`}
            className="size-24 rounded-2xl border object-cover"
          />
          <div className="space-y-1">
            <CardTitle className="text-xl">{profile.full_name}</CardTitle>
            <Badge variant="secondary">{result === "success" ? "Verified" : result}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-3 sm:grid-cols-2">
        <p>
          <span className="font-medium">UIN: </span>
          <span>{profile.uin}</span>
        </p>
        <p>
          <span className="font-medium">PCN: </span>
          <span>{profile.pcn ?? "—"}</span>
        </p>
        <p>
          <span className="font-medium">Birthday: </span>
          <span>{profile.dob}</span>
        </p>
        <p className="sm:col-span-2">
          <span className="font-medium">Gender: </span>
          <span>{profile.gender}</span>
        </p>
      </CardContent>
    </Card>
  )
}
