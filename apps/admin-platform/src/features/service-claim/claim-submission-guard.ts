export interface ClaimSubmissionGuard {
  run: <TResult>(action: () => Promise<TResult>) => Promise<TResult | null>
}

export function createClaimSubmissionGuard(): ClaimSubmissionGuard {
  let inFlight = false

  return {
    async run(action) {
      if (inFlight) {
        return null
      }

      inFlight = true
      try {
        return await action()
      } finally {
        inFlight = false
      }
    },
  }
}
