import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Building,
  Hash,
  MessageSquare,
  DollarSign,
  Truck,
  Archive,
  File,
} from 'lucide-react';
import requisitionService from '../../services/stockRequestService';
import { useSocketEvent } from '../../context/SocketContext';
import { formatPrice, formatRole, formatDate, formatTime } from '../../utils/dateUtils';
import useEmployeeAuth from '../../context/EmployeeAuthContext';
import useAdminAuth from '../../context/AdminAuthContext';
import UploadAttachmentModal from '../../components/dashboard/StockRequest/UploadAttachmentModal';
import AddCommentModal from '../../components/dashboard/StockRequest/AddCommentModal';
import { API_URL } from '../../api/api';


// Define interfaces based on Prisma schema
interface RequestItem {
  id: string;
  stockInId: string;
  stockIn: StockIn;
  qtyRequested: number;
  qtyIssued?: number;
  qtyRemaining?: number;
  qtyReceived?: number;
  createdAt: string;
  updatedAt: string;
}

interface StockIn {
  id: string;
  productName: string;
  sku?: string;
  unit: { symbol: string };
  unitPrice: number;
  description?: string;
}

interface StockHistory {
  id: string;
  stockInId: string;
  stockIn: StockIn;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
  sourceType: 'GRN' | 'ISSUE' | 'ADJUSTMENT' | 'RECEIPT';
  sourceId?: string;
  qtyBefore: number;
  qtyChange: number;
  qtyAfter: number;
  unitPrice?: number;
  notes?: string;
  createdByAdminId?: string;
  createdByAdmin?: { adminName: string };
  createdByEmployeeId?: string;
  createdByEmployee?: { first_name: string; last_name: string };
  createdAt: string;
}

interface User {
  full_name: string;
  email: string;
  phone: string;
  role?: { name: string };
  active: boolean;
}

interface Attachment {
  fileName: string;
  fileUrl: string;
  uploadedBy: 'ADMIN' | 'EMPLOYEE';
  uploadedById: string;
  uploadedAt: string;
  description?: string;
}

interface Comment {
  userId: string;
  role: 'ADMIN' | 'EMPLOYEE';
  description: string;
  uploadedAt: string;
}

interface MaterialRequisition {
  id: string;
  ref_no: string;
  siteId: string;
  site: { name: string; code: string; location: string };
  requestedByAdminId?: string;
  requestedByAdmin?: { adminName: string; adminEmail: string; phone: string; status: string };
  requestedByEmployeeId?: string;
  requestedByEmployee?: { first_name: string; last_name: string; email: string; phone: string; status: string };
  status: 'PENDING' | 'APPROVED' | 'PARTIALLY_ISSUED' | 'ISSUED' | 'REJECTED' | 'RECEIVED' | 'CLOSED';
  notes?: string;
  requestItems: RequestItem[];
  stockHistory?: StockHistory[];
  attachments?: Attachment[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
  receivedAt?: string;
  issuedAt?: string;
  closedAt?: string;
  rejectedAt?:string;
  issuedByAdminId?: string;
  issuedByAdmin?: { adminName: string };
  issuedByEmployeeId?: string;
  issuedByEmployee?: { first_name: string; last_name: string };
  closedByAdminId?: string;
  closedByAdmin?: { adminName: string };
  closedByEmployeeId?: string;
  closedByEmployee?: { first_name: string; last_name: string };
  rejectedByAdminId?:string;
  rejectedByAdmin?:{adminName:string};
  rejectedByEmployeeId?:string;
  rejectedByEmployee?:{first_name:string; last_name:string}
}

interface Props {
  role: 'admin' | 'employee';
}

const StockRequestManagementDetails: React.FC<Props> = ({ role }) => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<MaterialRequisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: employeeData } = useEmployeeAuth();
  const { user: adminData } = useAdminAuth();
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const isSiteEngineer = role === 'employee';
  const user = role === 'admin' ? adminData : employeeData;

  // Fetch requisition data
  useEffect(() => {
    const fetchRequisition = async () => {
      if (!id) {
        setError('No requisition ID provided');
        setLoading(false);
        return;
      }

      try {
        const data = await requisitionService.getRequestById(id);
        setRequest(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch requisition details');
        setLoading(false);
      }
    };

    fetchRequisition();
  }, [id]);

  // WebSocket event handlers for real-time updates
  useSocketEvent('requestCreated', (requestData: MaterialRequisition) => {
    // Ignore new requests for this detail view
  });

  useSocketEvent('requestUpdated', (requestData: MaterialRequisition) => {
    if (requestData.id === id) {
      setRequest(requestData);
    }
  });

  useSocketEvent('requestApproved', (requestData: MaterialRequisition) => {
    if (requestData.id === id) {
      setRequest(requestData);
    }
  });

  useSocketEvent('requestRejected', (requestData: MaterialRequisition) => {
    if (requestData.id === id) {
      setRequest(requestData);
    }
  });

  useSocketEvent('materialsIssued', (requestData: MaterialRequisition) => {
    if (requestData.id === id) {
      setRequest(requestData);
    }
  });

  useSocketEvent('materialsReceived', (requestData: MaterialRequisition) => {
    if (requestData.id === id) {
      setRequest(requestData);
    }
  });

  useSocketEvent('requestClosed', (requestData: MaterialRequisition) => {
    if (requestData.id === id) {
      setRequest(requestData);
    }
  });

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PARTIALLY_ISSUED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ISSUED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RECEIVED':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Status icon helper
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5" />;
      case 'APPROVED': return <CheckCircle className="w-5 h-5" />;
      case 'PARTIALLY_ISSUED': return <AlertCircle className="w-5 h-5" />;
      case 'ISSUED': return <Truck className="w-5 h-5" />;
      case 'REJECTED': return <AlertCircle className="w-5 h-5" />;
      case 'RECEIVED': return <Package className="w-5 h-5" />;
      case 'CLOSED': return <Archive className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  // Calculate total value of requested items
  const calculateTotalValue = (items: RequestItem[]) => {
    if (isSiteEngineer || role === 'employee') return 0;
    return items.reduce((total, item) => {
      return total + ((item.qtyRequested || 0) * (item.stockIn.unitPrice || 0));
    }, 0);
  };

  // Get item status
  const getItemStatus = (item: RequestItem) => {
    const qtyRequested = Number(item.qtyRequested) || 0;
    const qtyIssued = Number(item.qtyIssued) || 0;
    const qtyReceived = Number(item.qtyReceived) || 0;
    const qtyRemaining = Number(item.qtyRemaining) || 0;

    if (qtyReceived >= qtyRequested) {
      return { label: 'Fully Received', color: 'bg-teal-100 text-teal-800 border-teal-200' };
    } else if (qtyReceived > 0) {
      return { label: 'Partially Received', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
    } else if (qtyIssued >= qtyRequested) {
      return { label: 'Fully Issued', color: 'bg-green-100 text-green-800 border-green-200' };
    } else if (qtyIssued > 0 && qtyRemaining > 0) {
      return { label: 'Partially Issued', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    } 
   
    else {
      if(request?.status == 'REJECTED'){
        return { label: 'Rejected The Request', color: 'bg-red-100 text-red-800 border-red-200' }
      }
      return { label: 'Not Available', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  // Get requested by user
  const getRequestedBy = () => {
    if (request?.requestedByAdminId && request.requestedByAdmin) {
      return {
        full_name: request.requestedByAdmin.adminName || 'N/A',
        email: request.requestedByAdmin.adminEmail || 'N/A',
        phone: request.requestedByAdmin.phone || 'N/A',
        role: { name: 'ADMIN' },
        active: request.requestedByAdmin.status === 'ACTIVE'
      };
    } else if (request?.requestedByEmployeeId && request.requestedByEmployee) {
      return {
        full_name: `${request.requestedByEmployee.first_name} ${request.requestedByEmployee.last_name}`,
        email: request.requestedByEmployee.email,
        phone: request.requestedByEmployee.phone,
        role: { name: request.requestedByEmployee.position },
        active: request.requestedByEmployee.status === 'ACTIVE'
      };
    }
    return null;
  };

  // Get action by
  const getActionBy = (adminId?: string, admin?: { adminName: string }, employeeId?: string, employee?: { first_name: string; last_name: string }) => {
    if (adminId && admin) {
      return admin.adminName? `${admin.adminName} (ADMIN)` :'N/A';
    } else if (employeeId && employee) {
      return `${employee.first_name} ${employee.last_name} (EMPLOYEE)`;
    }
    return 'N/A';
  };

  // Handle attachment upload
  const handleAttachmentUpload = async (file: File, description: string) => {
    if (!id || !user?.id) return;
    try {
      const body = {
        role: role.toUpperCase(),
        userId: user.id,
        description: description || undefined,
      };
      const attachments = await requisitionService.uploadAttachment(id, file, body);
      setRequest((prev) => prev ? { ...prev, attachments: [...(prev.attachments || []), ...attachments] } : prev);
      setIsAttachmentModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to upload attachment');
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (description: string) => {
    if (!id || !user?.id) return;
    try {
      const data = {
        userId: user.id,
        role: role.toUpperCase(),
        description,
        uploadedAt: new Date().toISOString(),
      };
      const comments = await requisitionService.addComment(id, data);
      setRequest((prev) => prev ? { ...prev, comments: [...(prev.comments || []), ...comments] } : prev);
      setIsCommentModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600 text-sm">Loading...</div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-sm">{error || 'No requisition data found'}</div>
      </div>
    );
  }

  const requestedBy = getRequestedBy();

  return (
    <div className="mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Request #{request.ref_no}</h1>
                <p className="text-sm text-gray-500">Material Request Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)} flex items-center`}>
                {getStatusIcon(request.status)}
                <span className="ml-1">{request.status.replace(/_/g, ' ')}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-sm text-gray-600">{formatDate(request.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-sm text-gray-600">{formatDate(request.updatedAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Issued</p>
                <p className="text-sm text-gray-600">{formatDate(request.issuedAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Archive className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Closed</p>
                <p className="text-sm text-gray-600">{formatDate(request.closedAt)}</p>
              </div>
            </div>
            {role === 'admin' && (
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Value</p>
                  <p className="text-sm text-gray-600">{formatPrice(calculateTotalValue(request.requestItems).toFixed(2))}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Site Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                Site Information
              </h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{request.site.name}</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Hash className="h-4 w-4 mr-1" />
                    {request.site.code}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {request.site.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Requested Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Requested Items ({request.requestItems?.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {role === 'admin' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {request.requestItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.stockIn.productName}</p>
                          {item.stockIn.unitPrice && (
                            <p className="text-xs text-gray-500">{formatPrice(item.stockIn.unitPrice)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(Number(item.qtyRequested) || 0).toFixed(3)} {item.stockIn.unit?.symbol || ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">
                          {(Number(item.qtyIssued) || 0).toFixed(3)} {item.stockIn.unit?.symbol || ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">
                          {(Number(item.qtyRemaining) || 0).toFixed(3)} {item.stockIn.unit?.symbol || ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">
                          {(Number(item.qtyReceived) || 0).toFixed(3)} {item.stockIn.unit?.symbol || ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getItemStatus(item).color}`}>
                          {getItemStatus(item).label}
                        </span>
                      </td>
                      {role === 'admin' && (
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatPrice((Number(item.qtyRequested) || 0) * (item.stockIn.unitPrice || 0))}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock History */}
          {request.stockHistory && request.stockHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  Stock History ({request.stockHistory.length})
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {request.stockHistory
                    .filter((history) => history.sourceId === request.id && ['ISSUE', 'RECEIPT'].includes(history.sourceType))
                    .map((history) => (
                      <div key={history.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{history.stockIn.productName}</span>
                          <span className={`text-sm font-medium ${
                            history.movementType === 'OUT' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {history.movementType} ({history.sourceType})
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Quantity: {history.qtyChange.toFixed(3)} {history.stockIn.unit?.symbol || ''} 
                          (Before: {history.qtyBefore.toFixed(3)}, After: {history.qtyAfter.toFixed(3)})
                        </p>
                        <p className="text-sm text-gray-600">
                          By: {getActionBy(history.createdByAdminId, history.createdByAdmin, history.createdByEmployeeId, history.createdByEmployee)}
                        </p>
                        {history.notes && (
                          <p className="text-sm text-gray-700 italic mt-1">"{history.notes}"</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{formatDate(history.createdAt)}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {request.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Notes
                </h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-700 leading-relaxed">{request.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => setIsAttachmentModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Upload Attachment
            </button>
            <button
              onClick={() => setIsCommentModalOpen(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Add Comment
            </button>
          </div>

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <File className="h-5 w-5 mr-2 text-blue-600" />
                  Attachments ({request.attachments.length})
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {request.attachments.map((attachment, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <a
                          href={`${API_URL}${attachment.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {attachment.fileUrl.replace('/uploads/attachment_images/','')}
                        </a>
                        <span className="text-sm text-gray-600">{attachment.uploadedBy}</span>
                      </div>
                      {attachment.description && (
                        <p className="text-sm text-gray-700 italic">"{attachment.description}"</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded by {attachment.uploadedBy} on {formatDate(attachment.uploadedAt)} {formatTime(attachment.uploadedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          {request.comments && request.comments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Comments ({request.comments.length})
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {request.comments.map((comment, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <p className="text-sm text-gray-700">{comment.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        By  {comment.role} on {formatDate(comment.uploadedAt)} {formatTime(comment.uploadedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Requested By */}
          {requestedBy && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Requested By
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{requestedBy.full_name}</p>
                    <p className="text-sm text-gray-600">{formatRole(requestedBy)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {requestedBy.email}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {requestedBy.phone}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      requestedBy.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {requestedBy.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions By */}
          {(request.requestedByAdminId || request.requestedByEmployeeId || request.issuedByAdminId || request.issuedByEmployeeId || request.closedByAdminId || request.closedByEmployeeId || request.rejectedByAdminId || request.rejectedByEmployeeId) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Actions By
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                {request.requestedByAdminId || request.requestedByEmployeeId ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Requested By</p>
                    <p className="text-sm text-gray-600">
                      {getActionBy(request.requestedByAdminId, request.requestedByAdmin, request.requestedByEmployeeId, request.requestedByEmployee)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(request.createdAt)} {formatTime(request.createdAt)}</p>
                  </div>
                ) : null}
                {request.issuedByAdminId || request.issuedByEmployeeId ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Issued By</p>
                    <p className="text-sm text-gray-600">
                      {getActionBy(request.issuedByAdminId, request.issuedByAdmin, request.issuedByEmployeeId, request.issuedByEmployee)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(request.issuedAt)} {formatTime(request.issuedAt)}</p>
                  </div>
                ) : null}
                {request.requestedByAdminId || request.requestedByEmployeeId ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Received By</p>
                    <p className="text-sm text-gray-600">
                      {getActionBy(request.requestedByAdminId, request.requestedByAdmin, request.requestedByEmployeeId, request.requestedByEmployee)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(request.receivedAt)} {formatTime(request.receivedAt)}</p>
                  </div>
                ) : null}
                {request.closedByAdminId || request.closedByEmployeeId ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Closed By</p>
                    <p className="text-sm text-gray-600">
                      {getActionBy(request.closedByAdminId, request.closedByAdmin, request.closedByEmployeeId, request.closedByEmployee)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(request.closedAt)} {formatTime(request.closedAt)}</p>
                  </div>
                ) : null}
                {request.rejectedByAdminId || request.rejectedByEmployeeId ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Rejected By</p>
                    <p className="text-sm text-gray-600">
                      {getActionBy(request.rejectedByAdminId, request.rejectedByAdmin, request.rejectedByEmployeeId, request.rejectedByEmployee)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(request.rejectedAt)} {formatTime(request.rejectedAt)}</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Items:</span>
                <span className="text-sm font-medium text-gray-900">{request.requestItems?.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Quantity Requested:</span>
                <span className="text-sm font-medium text-gray-900">
                  {request.requestItems.reduce((sum, item) => sum + (Number(item.qtyRequested) || 0), 0).toFixed(3)}
                </span>
              </div>
              {role === 'admin' && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-medium text-gray-900">Total Value:</span>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(calculateTotalValue(request.requestItems).toFixed(2))}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <UploadAttachmentModal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        onSubmit={handleAttachmentUpload}
      />
      <AddCommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onSubmit={handleCommentSubmit}
      />
    </div>
  );
};

export default StockRequestManagementDetails;