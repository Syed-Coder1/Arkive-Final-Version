// src/components/ReceiptFormModal.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import {
  Receipt as ReceiptIcon,
  X,
  User,
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  Briefcase
} from 'lucide-react';

interface ReceiptFormModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  editingReceipt: any;
  cnicSuggestions: any[];
  showCnicSuggestions: boolean;
  setShowCnicSuggestions: (show: boolean) => void;
  resetForm: () => void;
}

const ReceiptFormModal: React.FC<ReceiptFormModalProps> = ({
  show,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingReceipt,
  cnicSuggestions,
  showCnicSuggestions,
  setShowCnicSuggestions,
  resetForm,
}) => {
  if (!show) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
      onClick={() => {
        resetForm();
        onClose();
      }}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-7xl h-[85vh] flex flex-col shadow-2xl border border-gray-200/20 dark:border-gray-700/30"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-2xl">
              <ReceiptIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingReceipt ? 'Edit Receipt' : 'New Receipt'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {editingReceipt ? 'Update receipt information' : 'Create a new payment receipt'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-2xl transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-hidden">
          <form onSubmit={onSubmit} className="h-full flex flex-col">
            <div className="flex-1 px-8 py-6">
              {/* Main Grid Layout - 3 columns for better horizontal usage */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                
                {/* Column 1: Client Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Client Information</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="Enter client name"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 placeholder-gray-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Client CNIC *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.clientCnic}
                          onChange={e => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                            setFormData({ ...formData, clientCnic: value });
                            setShowCnicSuggestions(value.length >= 3);
                          }}
                          onFocus={() => setShowCnicSuggestions(formData.clientCnic.length >= 3)}
                          onBlur={() => setTimeout(() => setShowCnicSuggestions(false), 200)}
                          placeholder="Enter 13-digit CNIC"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 placeholder-gray-400"
                          maxLength={13}
                          required
                        />
                        
                        {/* CNIC Suggestions Dropdown */}
                        {showCnicSuggestions && cnicSuggestions.length > 0 && (
                          <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            {cnicSuggestions.map(client => (
                              <button
                                key={client.id}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    clientName: client.name,
                                    clientCnic: client.cnic
                                  });
                                  setShowCnicSuggestions(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">CNIC: {client.cnic}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-green-600 dark:text-green-400">{client.type}</p>
                                    {client.phone && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{client.phone}</p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Client will be auto-created if doesn't exist
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 2: Payment Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Details</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Amount *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.amount}
                          onChange={e => {
                            const digits = e.target.value.replace(/[^\d]/g, '');
                            setFormData({
                              ...formData,
                              amount: digits ? parseInt(digits, 10).toLocaleString('en-PK') : '',
                            });
                          }}
                          placeholder="Enter amount"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Payment Method *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        <select
                          value={formData.paymentMethod}
                          onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Select payment method</option>
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="cheque">Cheque</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="easypaisa">EasyPaisa</option>
                          <option value="jazzcash">JazzCash</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={formData.date}
                          onChange={e => setFormData({ ...formData, date: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Work Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Work Details</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nature of Work
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        value={formData.natureOfWork}
                        onChange={e => setFormData({ ...formData, natureOfWork: e.target.value })}
                        placeholder="Describe the nature of work or service provided..."
                        rows={12}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200 resize-none placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200/50 dark:border-gray-700/50 rounded-b-3xl">
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    resetForm?.();
                    onClose();
                  }}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {editingReceipt ? 'Update Receipt' : 'Create Receipt'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;
  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default ReceiptFormModal;