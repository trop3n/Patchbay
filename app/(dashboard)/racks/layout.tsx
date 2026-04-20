export default function RacksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark bg-[hsl(var(--surface-0))] text-foreground -m-6 p-6 min-h-[calc(100%+3rem)]">
      {children}
    </div>
  )
}
