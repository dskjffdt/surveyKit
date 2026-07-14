import { useMemo } from 'react'
import type { Survey } from '../../types/question'
import { buildOverviewCards, OVERVIEW_TONES } from '../../services/surveyOverview'

interface OverviewCardsProps {
  surveys: Survey[]
  className?: string
}

export function OverviewCards({ surveys, className }: OverviewCardsProps) {
  const cards = useMemo(() => buildOverviewCards(surveys), [surveys])

  return (
    <div className={['overview-cards', 'page-overview', className].filter(Boolean).join(' ')}>
      {cards.map((card, index) => (
        <div
          key={card.label}
          className={`overview-card overview-card--${OVERVIEW_TONES[index]}`}
        >
          <span className="overview-value">{card.value}</span>
          <span className="overview-label">{card.label}</span>
        </div>
      ))}
    </div>
  )
}
