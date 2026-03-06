import * as Tooltip from '@radix-ui/react-tooltip'

function InfoTooltip({ content }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span
          tabIndex={0}
          className="ml-1 inline-flex cursor-default items-center text-zinc-500 hover:text-zinc-300 focus:text-zinc-300 focus:outline-none"
          aria-label={typeof content === 'string' ? content : 'More info'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 max-w-[220px] rounded bg-zinc-800 px-3 py-2 text-xs leading-relaxed text-zinc-200 shadow-lg"
          sideOffset={4}
        >
          {content}
          <Tooltip.Arrow className="fill-zinc-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export { InfoTooltip }
