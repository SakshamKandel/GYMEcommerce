const ErrorMessage = ({ error, 'data-testid': dataTestid }: { error?: string | null, 'data-testid'?: string }) => {
  if (!error) {
    return null
  }

  return (
    <div
      className="pt-2 flex items-center gap-x-1.5 text-red font-body text-body-sm"
      data-testid={dataTestid}
    >
      <span aria-hidden="true" className="font-bold">
        !
      </span>
      <span>{error}</span>
    </div>
  )
}

export default ErrorMessage
