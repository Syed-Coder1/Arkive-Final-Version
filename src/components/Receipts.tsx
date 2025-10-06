// src/components/Receipts.tsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Eye,
  Download,
  Trash2,
  Edit,
  Calendar,
  Filter,
  Receipt as ReceiptIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useReceipts, useClients } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { exportService } from '../services/export';
import { firebaseSync } from '../services/firebaseSync';
import { db } from '../services/database';
import ReceiptFormModal from './ReceiptFormModal';


interface ReceiptsProps {
  showForm?: boolean;
  onCloseForm?: () => void;
}

export default function Receipts({ showForm: externalShowForm, onCloseForm }: ReceiptsProps) {
  const { receipts: localReceipts, loading } = useReceipts();
  const { clients } = useClients();
  const { user } = useAuth();

  // Local state for UI
  const [receipts, setReceipts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState<boolean>(externalShowForm || false);
  const [editingReceipt, setEditingReceipt] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [, setShowPreview] = useState(false);
  const [, setSelectedReceipt] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCnicSuggestions, setShowCnicSuggestions] = useState(false);
  const [cnicSuggestions, setCnicSuggestions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    clientName: '',
    clientCnic: '',
    amount: '',
    natureOfWork: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'cheque' | 'bank_transfer' | 'easypaisa' | 'jazzcash',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  // Filter clients for CNIC suggestions
  React.useEffect(() => {
    if (formData.clientCnic.length >= 3) {
      const suggestions = clients.filter(client => 
        client.cnic.includes(formData.clientCnic) || 
        client.name.toLowerCase().includes(formData.clientCnic.toLowerCase())
      ).slice(0, 5);
      setCnicSuggestions(suggestions);
    } else {
      setCnicSuggestions([]);
    }
  }, [formData.clientCnic, clients]);

  // Normalize receipt data
  const normalize = (item: any) => {
    if (!item) return item;
    
    const safeDate = (() => {
      if (!item.date) return new Date();
      if (item.date instanceof Date) return item.date;
      const d = new Date(item.date);
      return isNaN(d.getTime()) ? new Date() : d;
    })();

    const safeAmount = (() => {
      if (typeof item.amount === 'number') return item.amount;
      if (typeof item.amount === 'string') {
        const digits = item.amount.replace(/[^\d-]/g, '');
        const parsed = parseInt(digits || '0', 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    })();

    return { ...item, date: safeDate, amount: safeAmount };
  };

  // Merge remote data safely
  const mergeRemoteReceipts = (remoteItems: any[]) => {
    if (!Array.isArray(remoteItems)) return;

    const normalizedRemote = remoteItems.map(normalize);
    const map = new Map<string, any>();
    
    // Add current receipts to map
    receipts.forEach((r) => {
      if (r && r.id !== undefined) map.set(String(r.id), normalize(r));
    });

    // Merge remote data (remote takes precedence)
    normalizedRemote.forEach((r) => {
      if (r && r.id !== undefined) {
        map.set(String(r.id), r);
      }
    });

    // Sort by date descending
    const merged = Array.from(map.values()).sort((a, b) => {
      const ta = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
      const tb = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
      return tb - ta;
    });

    setReceipts(merged);
  };

  // Sync local receipts to UI
  useEffect(() => {
    if (!Array.isArray(localReceipts)) {
      setReceipts([]);
      return;
    }
    
    const normalizedLocal = localReceipts.map(normalize);
    const map = new Map<string, any>();
    
    // Keep existing receipts (might have Firebase data)
    receipts.forEach((r) => {
      if (r && r.id !== undefined) map.set(String(r.id), r);
    });

    // Add local receipts (but don't overwrite Firebase data)
    normalizedLocal.forEach((lr) => {
      if (lr && lr.id !== undefined && !map.has(String(lr.id))) {
        map.set(String(lr.id), lr);
      }
    });

    const merged = Array.from(map.values()).sort((a, b) => {
      const ta = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
      const tb = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
      return tb - ta;
    });

    setReceipts(merged);
  }, [localReceipts]);

  // Setup Firebase realtime listener
  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    try {
      firebaseSync.setupRealtimeListener('receipts', (remoteData: any[]) => {
        if (!mounted) return;
        try {
          console.log('📡 Realtime receipts from Firebase:', remoteData.length);
          mergeRemoteReceipts(remoteData);
        } catch (error) {
          console.error('Error processing realtime receipts:', error);
        }
      });
    } catch (error) {
      console.error('Failed to start realtime receipts listener:', error);
    }

    return () => {
      mounted = false;
      firebaseSync.removeRealtimeListener('receipts');
    };
  }, [user?.id]);

  // Handle external form control
  useEffect(() => {
    if (externalShowForm !== undefined) {
      setShowForm(externalShowForm);
    }
  }, [externalShowForm]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientCnic: '',
      amount: '',
      natureOfWork: '',
      paymentMethod: 'cash',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setEditingReceipt(null);
  };


  const handleEdit = (receipt: any) => {
    setFormData({
      clientName: receipt.clientName,
      clientCnic: receipt.clientCnic,
      amount: receipt.amount?.toString() ?? '',
      natureOfWork: receipt.natureOfWork,
      paymentMethod: receipt.paymentMethod,
      date: format(receipt.date instanceof Date ? receipt.date : new Date(receipt.date), 'yyyy-MM-dd'),
    });
    setEditingReceipt(receipt);
    setShowForm(true);
  };

  const handleDelete = async (receiptId: string, clientName: string) => {
    if (confirm(`⚠️ DELETE CONFIRMATION\n\nAre you sure you want to delete the receipt for "${clientName}"?\n\nThis action cannot be undone and will be synced across all devices.`)) {
      try {
        await db.deleteReceipt(receiptId);
        
        // Update UI immediately
        setReceipts(prev => prev.filter(r => r.id !== receiptId));
        showMessage('✅ Receipt deleted successfully and synced to Firebase!', 'success');
        
        // Log activity
        await db.createActivity({
          userId: user!.id,
          action: 'delete_receipt',
          details: `Deleted receipt for ${clientName} (ID: ${receiptId}) - Amount: ₨${receipts.find(r => r.id === receiptId)?.amount?.toLocaleString() || 'Unknown'}`,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error deleting receipt:', error);
        showMessage('❌ Error deleting receipt. Please try again.', 'error');
      }
    }
  };

  const handlePreview = (receipt: any) => {
    setSelectedReceipt(receipt);
    setShowPreview(true);
  };

  const handleExport = async () => {
    try {
      await exportService.exportReceiptsToExcel(receipts, clients);
      showMessage('Receipts exported successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showMessage('Error exporting receipts', 'error');
    }
  };

  // Add this handler for form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (
        !formData.clientName.trim() ||
        !formData.clientCnic.trim() ||
        !formData.amount ||
        !formData.paymentMethod ||
        !formData.date
      ) {
        showMessage('Please fill all required fields.', 'error');
        return;
      }

      // Prepare receipt data
      const receiptData = {
        clientName: formData.clientName,
        clientCnic: formData.clientCnic,
        amount: typeof formData.amount === 'string'
          ? parseInt(formData.amount.replace(/[^\d-]/g, ''), 10)
          : formData.amount,
        natureOfWork: formData.natureOfWork,
        paymentMethod: formData.paymentMethod as 'cash' | 'card' | 'cheque' | 'bank_transfer' | 'easypaisa' | 'jazzcash',
        date: new Date(formData.date),
      };

      if (editingReceipt) {
        // Update existing receipt
        await db.updateReceipt(editingReceipt, receiptData);
        showMessage('Receipt updated successfully!', 'success');
      } else {
        // Create new receipt
        await db.createReceipt({
          ...receiptData,
          paymentMethod: (formData.paymentMethod === 'easypaisa' || formData.paymentMethod === 'jazzcash')
            ? 'online'
            : formData.paymentMethod,
          createdBy: user?.id || '',
        });
        showMessage('Receipt created successfully!', 'success');
      }

      resetForm();
      setShowForm(false);
      if (onCloseForm) onCloseForm();
    } catch (error) {
      console.error('Error saving receipt:', error);
      showMessage('Error saving receipt. Please try again.', 'error');
    }
  };

  // Filter receipts
  const filteredReceipts = receipts.filter(receipt => {
    const client = clients.find((c: any) => c.cnic === receipt.clientCnic);
    const matchesSearch = !searchTerm ||
      (receipt.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (receipt.clientCnic || '').includes(searchTerm) ||
      (client?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPaymentMethod = !filterPaymentMethod || receipt.paymentMethod === filterPaymentMethod;

    return matchesSearch && matchesPaymentMethod;
  });

  const totalRevenue = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);

  // Safe format wrapper
  const safeFormat = (d: any, fmt = 'MMM dd, yyyy') => {
    try {
      const date = d instanceof Date ? d : new Date(d);
      if (isNaN(date.getTime())) return '-';
      return format(date, fmt);
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        } animate-slideInRight`}>
          <div className="flex items-center">
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
            {message.text}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ReceiptIcon className="w-7 h-7 text-blue-600" />
            Receipts Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Total Revenue: PKR {totalRevenue.toLocaleString('en-PK')} • {receipts.length} receipts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 hover:scale-105"
          >
            <Download size={20} />
            Export
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
          >
            <Plus size={20} />
            New Receipt
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Receipts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{receipts.length}</p>
            </div>
            <ReceiptIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-green-600">
                {receipts.filter(r => safeFormat(r.date, 'yyyy-MM') === safeFormat(new Date(), 'yyyy-MM')).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Amount</p>
              <p className="text-2xl font-bold text-purple-600">
                PKR {receipts.length > 0 ? Math.round(totalRevenue / receipts.length).toLocaleString('en-PK') : 0}
              </p>
            </div>
            <ReceiptIcon className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Clients</p>
              <p className="text-2xl font-bold text-orange-600">
                {new Set(receipts.map(r => r.clientCnic)).size}
              </p>
            </div>
            <ReceiptIcon className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client name or CNIC..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
            />
          </div>

          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="">All Payment Methods</option>
            <option value="cash">💵 Cash</option>
            <option value="card">💳 Card</option>
            <option value="cheque">🏦 Cheque</option>
            <option value="bank_transfer">🏛️ Bank Transfer</option>
            <option value="easypaisa">📱 EasyPaisa</option>
            <option value="jazzcash">📲 JazzCash</option>
          </select>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4 mr-2" />
            Showing {filteredReceipts.length} of {receipts.length} receipts
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CNIC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReceipts.map((receipt, index) => (
                <tr key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {safeFormat(receipt.date, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {receipt.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {receipt.clientCnic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    PKR {(receipt.amount || 0).toLocaleString('en-PK')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 capitalize">
                      {(receipt.paymentMethod || '').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePreview(receipt)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
                        title="Preview Receipt"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(receipt)}
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors duration-200"
                        title="Edit Receipt"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(receipt.id, receipt.clientName)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                        title="Delete Receipt"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReceipts.length === 0 && (
          <div className="text-center py-12">
            <ReceiptIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No receipts found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {receipts.length === 0
                ? "Create your first receipt to get started"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              <Plus size={20} />
              Create Receipt
            </button>
          </div>
        )}
      </div>

      <ReceiptFormModal
        show={showForm}
        onClose={() => {
          resetForm();
          setShowForm(false);
          if (onCloseForm) onCloseForm();
        }}
        editingReceipt={editingReceipt}
        formData={formData}
        setFormData={setFormData}
        showCnicSuggestions={showCnicSuggestions}
        cnicSuggestions={cnicSuggestions}
        setShowCnicSuggestions={setShowCnicSuggestions}
        onSubmit={handleFormSubmit}
        resetForm={resetForm}
      />
    </div>
  );
}