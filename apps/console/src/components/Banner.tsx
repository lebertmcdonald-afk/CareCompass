import './Banner.css'

type BannerProps = {
  type: 'success' | 'error'
  message: string
  onDismiss?: () => void
}

export function Banner({ type, message, onDismiss }: BannerProps) {
  return (
    <div role="alert" className={`banner banner--${type}`}>
      <span className="banner__message">{message}</span>
      {onDismiss && (
        <button className="banner__dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  )
}
