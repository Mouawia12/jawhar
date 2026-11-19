/** A section title with the JAWHAR stitch under it; the stitch sews in when the title scrolls into view. */
export function SectionHeading({
  id,
  children,
  size = 'lg',
  className,
}: {
  id: string
  children: React.ReactNode
  size?: 'lg' | 'md'
  className?: string
}) {
  return (
    <div data-reveal className={className}>
      <h2 id={id} className={`display ${size === 'lg' ? 'text-3xl md:text-5xl' : 'text-3xl md:text-4xl'}`}>
        {children}
      </h2>
      <div className="heading-stitch stitch mt-3 w-20 md:w-28" aria-hidden="true" />
    </div>
  )
}
