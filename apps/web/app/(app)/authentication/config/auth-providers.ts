export type authProviderId = "google" | "microsoft" | "email"

export const AUTH_PROVIDERS: {
  id: authProviderId
  label: string
  iconPath?: string
}[] = [
  {
    id: "google",
    label: "Continue with Google",
    iconPath: "/vectors/google.svg",
  },
  {
    id: "microsoft",
    label: "Continue with Microsoft",
    iconPath: "/vectors/microsoft.svg",
  },
]
