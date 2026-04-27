import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@openlguid/ui/components/card"

import type { IdDetails, VerificationResult } from "../features/verification/types/verification.js"

interface ResidentProfileCardProps{
  result: VerificationResult,
  profile: IdDetails
}

export function ResidentProfileCard({ result, profile }: ResidentProfileCardProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
          // TODO: Mock src here replacing the standard:
            // src={"data:image/jpg;base64," profile.face}
            src={"data:image/svg+xml;base64," + profile.face}
            alt={`${profile.full_name} face photo`}
            className="size-24 rounded-2xl border object-cover"
          />
          <div>
            <CardTitle className="text-xl">{profile.full_name}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-3 sm:grid-cols-2">
        <p>
          <span className="font-medium">LGU ID number: </span>
          <span>{profile.local_id}</span>
        </p>
        {/* 
        <p>
          <span className="font-medium">Issuer: </span>
          <span>{profile.issued_by}</span>
        </p> */}
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
