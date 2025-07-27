import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Reply, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  User,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

interface Message {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
  admin_reply?: string
  replied_at?: string
  replied_by?: string
}

const MessageStatusBadge = ({ status }: { status: Message['status'] }) => {
  const statusConfig = {
    new: { variant: 'default' as const, label: 'New', icon: AlertCircle, color: 'bg-blue-100 text-blue-800' },
    read: { variant: 'secondary' as const, label: 'Read', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    replied: { variant: 'default' as const, label: 'Replied', icon: Reply, color: 'bg-green-100 text-green-800' },
    resolved: { variant: 'default' as const, label: 'Resolved', icon: CheckCircle, color: 'bg-gray-100 text-gray-800' },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge className={config.color}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  )
}

const PriorityBadge = ({ priority }: { priority: Message['priority'] }) => {
  const priorityConfig = {
    low: { color: 'bg-green-100 text-green-800', label: 'Low' },
    medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
    high: { color: 'bg-red-100 text-red-800', label: 'High' },
  }

  const config = priorityConfig[priority]

  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  )
}

const MessageDetailsDialog = ({ 
  message, 
  onClose, 
  onStatusUpdate,
  onReply 
}: {
  message: Message
  onClose: () => void
  onStatusUpdate: (messageId: string, newStatus: Message['status']) => void
  onReply: (messageId: string, reply: string) => void
}) => {
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  const handleStatusUpdate = async (newStatus: Message['status']) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', message.id)

      if (error) throw error

      toast.success(`Message status updated to ${newStatus}`)
      onStatusUpdate(message.id, newStatus)
    } catch (error) {
      console.error('Error updating message status:', error)
      toast.error('Failed to update message status')
    }
  }

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message')
      return
    }

    setSending(true)
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          admin_reply: replyText,
          status: 'replied',
          replied_at: new Date().toISOString(),
          replied_by: 'Admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', message.id)

      if (error) throw error

      toast.success('Reply sent successfully!')
      onReply(message.id, replyText)
      setReplyText('')
      onClose()
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  const statusOptions: Message['status'][] = ['new', 'read', 'replied', 'resolved']

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Message Details</DialogTitle>
        <DialogDescription>
          Received on {format(new Date(message.created_at), 'PPP')}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Message Status & Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status & Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageStatusBadge status={message.status} />
                <PriorityBadge priority={message.priority} />
              </div>
              <div className="flex gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={message.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusUpdate(status)}
                    disabled={message.status === status}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Name:</span> {message.name}
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Email:</span> 
              <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline">
                {message.email}
              </a>
            </div>
            {message.phone && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Phone:</span> 
                <a href={`tel:${message.phone}`} className="text-blue-600 hover:underline">
                  {message.phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Received:</span> 
              {format(new Date(message.created_at), 'PPP p')}
            </div>
          </CardContent>
        </Card>

        {/* Original Message */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subject: {message.subject}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap text-gray-800">{message.message}</p>
            </div>
          </CardContent>
        </Card>

        {/* Previous Reply (if exists) */}
        {message.admin_reply && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Previous Reply</CardTitle>
              <CardDescription>
                Replied by {message.replied_by} on {message.replied_at && format(new Date(message.replied_at), 'PPP p')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="whitespace-pre-wrap text-gray-800">{message.admin_reply}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reply Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Send Reply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reply">Your Reply</Label>
              <textarea
                id="reply"
                className="w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm resize-vertical"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply to the customer..."
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleReply} disabled={sending || !replyText.trim()}>
                {sending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  )
}

export const MessagesManagement = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = (messageId: string, newStatus: Message['status']) => {
    setMessages(messages.map(message => 
      message.id === messageId ? { ...message, status: newStatus } : message
    ))
    if (selectedMessage?.id === messageId) {
      setSelectedMessage({ ...selectedMessage, status: newStatus })
    }
  }

  const handleReply = (messageId: string, reply: string) => {
    setMessages(messages.map(message => 
      message.id === messageId 
        ? { 
            ...message, 
            admin_reply: reply, 
            status: 'replied' as const,
            replied_at: new Date().toISOString(),
            replied_by: 'Admin'
          } 
        : message
    ))
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !selectedStatus || message.status === selectedStatus
    const matchesPriority = !selectedPriority || message.priority === selectedPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  const statusOptions = ['new', 'read', 'replied', 'resolved']
  const priorityOptions = ['low', 'medium', 'high']

  const getMessageStats = () => {
    const total = messages.length
    const newMessages = messages.filter(m => m.status === 'new').length
    const replied = messages.filter(m => m.status === 'replied').length
    const resolved = messages.filter(m => m.status === 'resolved').length

    return { total, newMessages, replied, resolved }
  }

  const stats = getMessageStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Messages Management</h2>
          <p className="text-slate-600">Manage customer inquiries and support requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Messages</p>
                <p className="text-2xl font-bold text-blue-600">{stats.newMessages}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Replied</p>
                <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
              </div>
              <Reply className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages by name, email, subject, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full lg:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-48">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">All Priority</option>
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Messages ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{message.name}</div>
                      <div className="text-sm text-gray-500">{message.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{message.subject}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {message.message.substring(0, 60)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <MessageStatusBadge status={message.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={message.priority} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(message.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(message.created_at), 'h:mm a')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedMessage(message)
                        setShowDetailsDialog(true)
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMessages.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No messages found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        {selectedMessage && (
          <MessageDetailsDialog
            message={selectedMessage}
            onClose={() => setShowDetailsDialog(false)}
            onStatusUpdate={handleStatusUpdate}
            onReply={handleReply}
          />
        )}
      </Dialog>
    </div>
  )
}