import type { AnswerValue, MultipleQuestion, Question, SingleQuestion } from '../../types/question'
import { QUESTION_TYPE_LABELS } from '../../types/question'

interface QuestionRendererProps {
  question: Question
  mode: 'edit' | 'fill'
  index: number
  value?: AnswerValue
  onChange?: (value: AnswerValue) => void
  onUpdate?: (patch: Partial<Question>) => void
  onDelete?: () => void
}

export function QuestionRenderer(props: QuestionRendererProps) {
  const { question, mode, index } = props

  if (mode === 'fill') {
    return <FillView question={question} index={index} value={props.value} onChange={props.onChange} />
  }

  return (
    <EditView
      question={question}
      index={index}
      onUpdate={props.onUpdate}
      onDelete={props.onDelete}
    />
  )
}

function EditView({
  question,
  index,
  onUpdate,
  onDelete,
}: Pick<QuestionRendererProps, 'question' | 'index' | 'onUpdate' | 'onDelete'>) {
  return (
    <div className="question-card edit">
      <div className="question-header">
        <span className="question-type-badge">{QUESTION_TYPE_LABELS[question.type]}</span>
        <div className="question-actions">
          <button type="button" className="danger" onClick={onDelete}>删除</button>
        </div>
      </div>
      <input
        className="input"
        value={question.title}
        onChange={(e) => onUpdate?.({ title: e.target.value })}
        placeholder={`第 ${index + 1} 题标题`}
      />
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={question.required}
          onChange={(e) => onUpdate?.({ required: e.target.checked })}
        />
        必填
      </label>
      {question.type === 'single' || question.type === 'multiple' ? (
        <ChoiceOptionsEditor question={question} onUpdate={onUpdate} />
      ) : question.type === 'text' ? (
        <>
          <input
            className="input"
            value={question.placeholder ?? ''}
            onChange={(e) => onUpdate?.({ placeholder: e.target.value })}
            placeholder="填写提示文字"
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={question.multiline ?? false}
              onChange={(e) => onUpdate?.({ multiline: e.target.checked })}
            />
            多行文本
          </label>
        </>
      ) : question.type === 'rating' ? (
        <label className="field-label">
          最高分
          <select
            className="input select"
            value={question.max}
            onChange={(e) => onUpdate?.({ max: Number(e.target.value) })}
          >
            {[5, 7, 10].map((n) => (
              <option key={n} value={n}>{n} 分</option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  )
}

function ChoiceOptionsEditor({
  question,
  onUpdate,
}: {
  question: SingleQuestion | MultipleQuestion
  onUpdate?: (patch: Partial<Question>) => void
}) {
  return (
    <div className="options-edit">
      {question.options.map((opt, i) => (
        <div key={i} className="option-edit-row">
          <input
            className="input"
            value={opt}
            onChange={(e) => {
              const options = [...question.options]
              options[i] = e.target.value
              onUpdate?.({ options })
            }}
          />
          <button
            type="button"
            className="danger"
            onClick={() => onUpdate?.({ options: question.options.filter((_, j) => j !== i) })}
            disabled={question.options.length <= 2}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn-secondary"
        onClick={() =>
          onUpdate?.({ options: [...question.options, `选项 ${question.options.length + 1}`] })
        }
      >
        + 添加选项
      </button>
    </div>
  )
}

function FillView({
  question,
  index,
  value,
  onChange,
}: Pick<QuestionRendererProps, 'question' | 'index' | 'value' | 'onChange'>) {
  return (
    <div className="question-card">
      <label className="question-title">
        {index + 1}. {question.title}
        {question.required && <span className="required">*</span>}
      </label>
      {renderFillBody(question, value, onChange)}
    </div>
  )
}

function renderFillBody(
  question: Question,
  value: AnswerValue | undefined,
  onChange?: (value: AnswerValue) => void,
) {
  switch (question.type) {
    case 'single':
      return (
        <div className="options">
          {question.options.map((opt) => (
            <label key={opt} className="option-item">
              <input
                type="radio"
                name={question.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange?.(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      )
    case 'multiple': {
      const selected = Array.isArray(value) ? value : []
      return (
        <div className="options">
          {question.options.map((opt) => (
            <label key={opt} className="option-item">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, opt]
                    : selected.filter((v) => v !== opt)
                  onChange?.(next)
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      )
    }
    case 'text': {
      const text = typeof value === 'string' ? value : ''
      return question.multiline ? (
        <textarea
          className="input textarea"
          value={text}
          placeholder={question.placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          rows={4}
        />
      ) : (
        <input
          className="input"
          type="text"
          value={text}
          placeholder={question.placeholder}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )
    }
    case 'rating': {
      const score = typeof value === 'number' ? value : 0
      return (
        <div className="rating-fill">
          {Array.from({ length: question.max }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={`rating-btn ${score >= n ? 'active' : ''}`}
              onClick={() => onChange?.(n)}
            >
              {n}
            </button>
          ))}
        </div>
      )
    }
    default: {
      const _exhaustive: never = question
      return _exhaustive
    }
  }
}
