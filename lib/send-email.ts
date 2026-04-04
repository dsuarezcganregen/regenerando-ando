/**
 * Send transactional email via API route
 * Called from client components after admin actions or registration
 */
export async function sendTransactionalEmail({
  type,
  profileId,
  reason,
  token,
}: {
  type: 'approved' | 'rejected' | 'welcome' | 'new_registration'
  profileId: string
  reason?: string
  token: string
}) {
  try {
    const response = await fetch('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, profileId, reason, token }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error sending email:', error)
      return { success: false, error: error.error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: 'Error de red' }
  }
}
