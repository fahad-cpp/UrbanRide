'use client'

import { useAuth } from '@/context/AuthContext'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Eye, Download } from 'lucide-react'
import { getEmailHistory } from '@/lib/emailService'

interface EmailRecord {
  id: string
  type: string
  recipientEmail: string
  subject: string
  sentAt: string
  data: any
}

export default function EmailHistoryPage() {
  const { user, isLoggedIn } = useAuth()
  const [emails, setEmails] = useState<EmailRecord[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const emailHistory = getEmailHistory()
    setEmails(emailHistory)
    setLoading(false)
  }, [])

  if (!isLoggedIn || !user || user.role !== 'admin') {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You must be an admin to access this page</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </main>
    )
  }

  const getEmailTypeLabel = (type: string) => {
    switch (type) {
      case 'booking_confirmation':
        return 'Booking Confirmation'
      case 'cancellation_confirmation':
        return 'Cancellation Confirmation'
      case 'welcome':
        return 'Welcome Email'
      default:
        return type
    }
  }

  const getEmailTypeColor = (type: string) => {
    switch (type) {
      case 'booking_confirmation':
        return 'bg-blue-100 text-blue-800'
      case 'cancellation_confirmation':
        return 'bg-red-100 text-red-800'
      case 'welcome':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Email History</h1>
          <Link href="/admin">
            <Button variant="outline">Back to Admin</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Email List */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading emails...</div>
              ) : emails.length === 0 ? (
                <div className="p-12 text-center">
                  <Mail className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">No emails sent yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {emails.reverse().map((email) => (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-6 cursor-pointer hover:bg-secondary transition ${
                        selectedEmail?.id === email.id ? 'bg-secondary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Mail className="text-primary mt-1 flex-shrink-0" size={24} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground truncate">
                              {email.subject}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getEmailTypeColor(
                                email.type
                              )}`}
                            >
                              {getEmailTypeLabel(email.type)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            To: {email.recipientEmail}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(email.sentAt).toLocaleString()}
                          </p>
                        </div>
                        <Eye className="text-muted-foreground flex-shrink-0" size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Email Preview */}
          {selectedEmail && (
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl shadow-md sticky top-20 border border-border">
                <div className="border-b border-border p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">Email Details</h3>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">
                      RECIPIENT
                    </p>
                    <p className="text-foreground break-all">{selectedEmail.recipientEmail}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">
                      SUBJECT
                    </p>
                    <p className="text-foreground">{selectedEmail.subject}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">
                      SENT AT
                    </p>
                    <p className="text-foreground">
                      {new Date(selectedEmail.sentAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground font-semibold mb-1">
                      TYPE
                    </p>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${getEmailTypeColor(
                        selectedEmail.type
                      )}`}
                    >
                      {getEmailTypeLabel(selectedEmail.type)}
                    </span>
                  </div>

                  {/* Email Data */}
                  {selectedEmail.type === 'booking_confirmation' && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground font-semibold mb-3">
                        BOOKING DETAILS
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vehicle:</span>
                          <span className="font-semibold text-foreground">
                            {selectedEmail.data.vehicleName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Booking ID:</span>
                          <span className="font-semibold text-foreground font-mono text-xs">
                            {selectedEmail.data.bookingId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Days:</span>
                          <span className="font-semibold text-foreground">
                            {selectedEmail.data.totalDays}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-semibold text-primary">
                            ${selectedEmail.data.totalPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button className="w-full mt-4 flex items-center justify-center gap-2">
                    <Download size={18} />
                    Download HTML
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
