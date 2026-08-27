/**
 * Renders report text with LIME word highlighting.
 * Words with positive weight (push toward SIF) = red
 * Words with negative weight (push toward routine) = green
 */
export default function WordHighlight({ text, explanation }) {
  if (!explanation || explanation.length === 0) {
    return <p className="reasoning-text">{text}</p>
  }

  // Build a map of word -> weight
  const wordMap = {}
  explanation.forEach(({ word, weight }) => {
    wordMap[word.toLowerCase()] = weight
  })

  // Split text into words, preserving whitespace and punctuation
  const tokens = text.split(/(\s+)/)

  return (
    <div className="highlighted-text">
      {tokens.map((token, i) => {
        const clean = token.replace(/[^a-zA-Z0-9\-/]/g, '').toLowerCase()
        const weight = wordMap[clean]

        if (weight !== undefined && Math.abs(weight) > 0.01) {
          const cls = weight > 0 ? 'danger' : 'safe'
          const opacity = Math.min(1, Math.abs(weight) * 5 + 0.3)
          return (
            <span
              key={i}
              className={`word-highlight ${cls}`}
              style={{ opacity }}
              title={`Importance: ${weight > 0 ? '+' : ''}${weight.toFixed(3)}`}
            >
              {token}
            </span>
          )
        }
        return <span key={i}>{token}</span>
      })}
    </div>
  )
}
