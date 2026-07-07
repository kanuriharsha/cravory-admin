import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/admin/StatusBadge';
import apiService from '@/services/api';
import { Complaint } from '@/types/admin';
import { 
  Search, 
  MessageSquare,
  Clock,
  User,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const COMPLAINT_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [resolution, setResolution] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await apiService.getComplaints();
      setComplaints(data as Complaint[]);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to fetch complaints');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.ticket_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          complaint.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openDetailDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAdminNotes(complaint.admin_notes);
    setResolution(complaint.resolution || '');
    setNewStatus(complaint.status);
    setIsDetailOpen(true);
  };

  const handleUpdateComplaint = async () => {
    if (selectedComplaint) {
      try {
        await apiService.updateComplaint(selectedComplaint._id, {
          status: newStatus as Complaint['status'],
          admin_notes: adminNotes,
          resolution: resolution || undefined
        });
        toast.success('Complaint updated successfully');
        fetchComplaints();
        setIsDetailOpen(false);
      } catch (error) {
        console.error('Error updating complaint:', error);
        toast.error('Failed to update complaint');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Complaints & Support</h1>
        <p className="text-sm text-muted-foreground">Manage customer complaints and support tickets</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticket ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1 sm:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {COMPLAINT_STATUSES.map(status => (
                <SelectItem key={status} value={status} className="capitalize">
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="flex-1 sm:w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Cards (hidden on md+) */}
      <div className="block md:hidden space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border rounded-lg bg-card">
            No complaints found
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint._id}
              className="border rounded-lg bg-card p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{complaint.ticket_id}</p>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                    <User className="h-3 w-3" />
                    <span>{complaint.customer.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={complaint.status} />
                  <StatusBadge status={complaint.priority} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Order ID</p>
                  <p className="font-medium truncate">{complaint.order_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issue</p>
                  <p className="font-medium capitalize">{complaint.issue_type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(new Date(complaint.created_at), 'MMM d, h:mm a')}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => openDetailDialog(complaint)}
                >
                  <MessageSquare className="mr-1 h-3 w-3" />
                  View
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden md:block border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Ticket ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Issue Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map((complaint) => (
                <TableRow key={complaint._id}>
                  <TableCell className="font-medium">{complaint.ticket_id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{complaint.customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{complaint.order_id}</TableCell>
                  <TableCell className="capitalize">{complaint.issue_type.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <StatusBadge status={complaint.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={complaint.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(complaint.created_at), 'MMM d, h:mm a')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetailDialog(complaint)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredComplaints.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No complaints found
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Ticket: {selectedComplaint?.ticket_id}</DialogTitle>
            <DialogDescription>
              Review and update this support ticket
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4 py-2">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Customer</p>
                  <p className="font-medium">{selectedComplaint.customer.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Order ID</p>
                  <p className="font-medium truncate">{selectedComplaint.order_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Issue Type</p>
                  <p className="font-medium capitalize">{selectedComplaint.issue_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Priority</p>
                  <StatusBadge status={selectedComplaint.priority} />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground text-xs">Description</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Status */}
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_STATUSES.map(status => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Notes */}
              <div className="grid gap-2">
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes for this ticket..."
                  rows={2}
                />
              </div>

              {/* Resolution */}
              <div className="grid gap-2">
                <Label htmlFor="resolution">Resolution</Label>
                <Textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="How was this issue resolved?"
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-row gap-2 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={() => setIsDetailOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleUpdateComplaint}>
              Update Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
