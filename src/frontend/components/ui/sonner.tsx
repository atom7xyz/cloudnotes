import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group select-none"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--font-weight": "500",
          "--shadow": "0 16px 24px rgba(0,0,0,0.12), 0 6px 12px rgba(0,0,0,0.08)",
          "--color": "var(--foreground)",
          "--muted": "var(--muted-foreground)"
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
