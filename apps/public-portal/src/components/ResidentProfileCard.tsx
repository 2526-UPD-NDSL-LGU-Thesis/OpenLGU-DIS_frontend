import { Badge } from "@openlguid/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@openlguid/ui/components/card"

import type { IdDetails } from "../features/verification/types/verification.js"

interface ResidentProfileCardProps {
  status: string
  profile: IdDetails
}

export function ResidentProfileCard({ status, profile }: ResidentProfileCardProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={"data:image/jpg;base64," + profile.face_data}
            alt={`${profile.full_name} face photo`}
            className="size-24 rounded-2xl border object-cover"
          />
          <div>
            <CardTitle className="text-xl">{profile.full_name}</CardTitle>
            <CardDescription>Result: {status.toUpperCase()}</CardDescription>
          </div>
        </div>
        <Badge variant="secondary">
          {profile.issuerType === "NATIONAL" ? "National ID" : "LGU ID"}
        </Badge>
      </CardHeader>

      <CardContent className="grid gap-3 sm:grid-cols-2">
        <p>
          <span className="font-medium">LGU ID number: </span>
          <span>{profile.lgu_uid}</span>
        </p>
        <p>
          <span className="font-medium">PCN: </span>
          <span>{profile.pcn}</span>
        </p>
        <p>
          <span className="font-medium">Issuer: </span>
          <span>{profile.issued_by}</span>
        </p>
        <p>
          <span className="font-medium">Birthday: </span>
          <span>{profile.birthdate}</span>
        </p>
        <p className="sm:col-span-2">
          <span className="font-medium">Gender: </span>
          <span>{profile.gender}</span>
        </p>
      </CardContent>
    </Card>
  )
}
