export function getUserId() {
  let id = localStorage.getItem('pulse_user_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('pulse_user_id', id)
  }
  return id
}
