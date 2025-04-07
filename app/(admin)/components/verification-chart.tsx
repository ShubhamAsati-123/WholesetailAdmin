import { getDashboardData } from "@/lib/data-fetching"

export async function VerificationChart() {
  const { pendingVerifications, approvedVerifications, rejectedVerifications } = await getDashboardData()

  return (
    <div className="flex h-[200px] items-center justify-center">
      <div className="text-center">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">{pendingVerifications}</div>
            <div className="h-2 w-full rounded bg-yellow-400"></div>
            <p className="mt-2 text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">{approvedVerifications}</div>
            <div className="h-2 w-full rounded bg-green-500"></div>
            <p className="mt-2 text-xs text-muted-foreground">Approved</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">{rejectedVerifications}</div>
            <div className="h-2 w-full rounded bg-red-500"></div>
            <p className="mt-2 text-xs text-muted-foreground">Rejected</p>
          </div>
        </div>
      </div>
    </div>
  )
}

