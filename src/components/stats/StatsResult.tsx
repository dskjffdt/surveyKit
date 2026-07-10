import type { QuestionStat } from '../../types/question'

interface StatsResultProps {
  stat: QuestionStat
  responseCount: number
}

export function StatsResult({ stat, responseCount }: StatsResultProps) {
  switch (stat.type) {
    case 'single':
    case 'multiple':
      return (
        <div className="choice-stats">
          {stat.stats.map((s) => (
            <div key={s.option} className="choice-stat-row">
              <span className="choice-label">{s.option}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${s.percentage}%` }} />
              </div>
              <span className="choice-count">
                {s.count} ({s.percentage}%)
              </span>
            </div>
          ))}
        </div>
      )

    case 'rating':
      return (
        <div className="rating-stats">
          <p className="rating-avg">平均分：{stat.stats.average}</p>
          {stat.stats.distribution.map((d) => (
            <div key={d.value} className="choice-stat-row">
              <span className="choice-label">{d.value} 分</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${responseCount > 0 ? Math.round((d.count / responseCount) * 100) : 0}%`,
                  }}
                />
              </div>
              <span className="choice-count">{d.count}</span>
            </div>
          ))}
        </div>
      )

    case 'text':
      return (
        <ul className="text-answers">
          {stat.stats.answers.length === 0 ? (
            <li className="empty-answer">（无回答）</li>
          ) : (
            stat.stats.answers.map((a, j) => <li key={j}>{a}</li>)
          )}
        </ul>
      )
  }
}
