import { getDashboardData } from "@/lib/data-fetching"

export async function RecentUsers() {
  const { recentUsers } = await getDashboardData()

  return (
    <div className="space-y-8">
      {recentUsers.length === 0 ? (
        <p className="text-center text-muted-foreground">No users yet</p>
      ) : (
        <div className="space-y-4">
          {recentUsers.map((user) => (
            <div key={user.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs capitalize">{user.role.toLowerCase()}</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    user.verificationStatus === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : user.verificationStatus === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user.verificationStatus.toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

