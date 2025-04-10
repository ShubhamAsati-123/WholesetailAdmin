// Simple utility functions for client-side auth management

// Store token in localStorage and sessionStorage for redundancy
export function storeAuthToken(token: string, remember = true) {
  // Always store in sessionStorage (cleared when browser is closed)
  sessionStorage.setItem("token", token)

  // Store in localStorage only if "remember me" is checked
  if (remember) {
    localStorage.setItem("token", token)
  }
}

// Get the auth token from storage
export function getAuthToken(): string | null {
  return localStorage.getItem("token") || sessionStorage.getItem("token")
}

// Remove token on logout
export function clearAuthToken() {
  localStorage.removeItem("token")
  sessionStorage.removeItem("token")
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}
