import { Badge } from "@openlgu-dis/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@openlgu-dis/ui/components/card"

import type { ResidentProfile } from "../../types/verification"

interface ResidentProfileCardProps {
  profile: ResidentProfile
}

export function ResidentProfileCard({ profile }: ResidentProfileCardProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={profile.facePhotoUrl}
            alt={`${profile.fullName} face photo`}
            className="size-24 rounded-2xl border object-cover"
          />
          <div>
            <CardTitle className="text-xl">{profile.fullName}</CardTitle>
            <CardDescription>Identity verification result</CardDescription>
          </div>
        </div>
        <Badge variant="secondary">
          {profile.qrType === "NATIONAL_ID" ? "National ID" : "LGU ID"}
        </Badge>
      </CardHeader>

      <CardContent className="grid gap-3 sm:grid-cols-2">
        <p>
          <span className="font-medium">Birthday: </span>
          <span>{profile.birthday}</span>
        </p>
        <p>
          <span className="font-medium">LGU ID Number: </span>
          <span>{profile.lguIdNumber}</span>
        </p>
        <p className="sm:col-span-2">
          <span className="font-medium">Address: </span>
          <span>{profile.address}</span>
        </p>
      </CardContent>
    </Card>
  )
}
