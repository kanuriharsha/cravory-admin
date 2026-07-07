import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'pending' | 'approved' | 'blocked' | 'active' | 'deleted'
  | 'placed' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'
  | 'open' | 'in_progress' | 'resolved' | 'closed'
  | 'paid' | 'failed'
  | 'veg' | 'non-veg'
  | 'low' | 'medium' | 'high';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  // Restaurant & Item Status
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700 border-green-200' },
  blocked: { label: 'Blocked', className: 'bg-red-100 text-red-700 border-red-200' },
  active: { label: 'Active', className: 'bg-green-100 text-green-700 border-green-200' },
  deleted: { label: 'Deleted', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  
  // Order Status
  placed: { label: 'Placed', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  confirmed: { label: 'Confirmed', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  preparing: { label: 'Preparing', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  ready: { label: 'Ready', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  picked_up: { label: 'Picked Up', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  delivered: { label: 'Delivered', className: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200' },
  
  // Complaint Status
  open: { label: 'Open', className: 'bg-red-100 text-red-700 border-red-200' },
  in_progress: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  resolved: { label: 'Resolved', className: 'bg-green-100 text-green-700 border-green-200' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  
  // Payment Status
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700 border-green-200' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700 border-red-200' },
  
  // Food Type
  veg: { label: 'Veg', className: 'bg-green-100 text-green-700 border-green-200' },
  'non-veg': { label: 'Non-Veg', className: 'bg-red-100 text-red-700 border-red-200' },
  
  // Priority
  low: { label: 'Low', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  high: { label: 'High', className: 'bg-red-100 text-red-700 border-red-200' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200' };
  
  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium border', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
