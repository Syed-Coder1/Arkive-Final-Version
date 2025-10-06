import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  Building,
  Phone,
  Mail,
  Shield,
  AlertCircle,
  CheckCircle,
  Download,
  Filter,
  User
} from 'lucide-react';
import { useClients } from '../hooks/useDatabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { exportService } from '../services/export';
import { ClientProfile } from './ClientProfile';
import ClientFormModal from './ClientFormModal';

interface ClientsProps {
  showForm?: boolean;
  onCloseForm?: () => void;
}

export function Clients({ showForm: externalShowForm, onCloseForm }: ClientsProps) {
  const { clients, createClient, updateClient, deleteClient, loading } = useClients();
  useAuth();
  const [showForm, setShowForm] = useState(externalShowForm ?? false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    password: '',
    type: 'Other' as 'IRIS' | 'SECP' | 'PRA' | 'Other',
    phone: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    if (externalShowForm !== undefined) setShowForm(externalShowForm);
  }, [externalShowForm]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cnic: '',
      password: '',
      type: 'Other',
      phone: '',
      email: '',
      notes: ''
    });
    setEditingClient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{13}$/.test(formData.cnic)) {
      showMessage('CNIC must be exactly 13 digits', 'error');
      return;
    }
    try {
      if (editingClient) {
        await updateClient({ ...editingClient, ...formData });
        showMessage('Client updated successfully!', 'success');
      } else {
        await createClient(formData);
        showMessage('Client created successfully!', 'success');
      }
      resetForm();
      setShowForm(false);
      onCloseForm?.();
    } catch (error) {
      showMessage('Error saving client. Please try again.', 'error');
    }
  };

  const handleEdit = (client: any) => {
    setFormData({
      name: client.name,
      cnic: client.cnic,
      password: client.password,
      type: client.type,
      phone: client.phone || '',
      email: client.email || '',
      notes: client.notes || ''
    });
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = async (clientId: string, clientName: string) => {
    if (confirm(`Are you sure you want to delete client "${clientName}"?`)) {
      try {
        await deleteClient(clientId);
        showMessage('Client deleted successfully!', 'success');
      } catch {
        showMessage('Error deleting client', 'error');
      }
    }
  };

  const handleViewProfile = (client: any) => setSelectedClient(client);

  const handleExport = async () => {
    try {
      await exportService.exportClientsToExcel(clients);
      showMessage('Clients exported successfully!', 'success');
    } catch {
      showMessage('Error exporting clients', 'error');
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchTerm ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cnic.includes(searchTerm) ||
      (client.phone && client.phone.includes(searchTerm)) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !filterType || client.type === filterType;
    return matchesSearch && matchesType;
  });

  if (selectedClient) {
    return <ClientProfile client={selectedClient} onBack={() => setSelectedClient(null)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
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
              <Users className="w-7 h-7 text-blue-600" />
              Clients Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage client profiles and track their complete history • {clients.length} clients
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
              New Client
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
                <p className="text-2xl font-bold text-blue-600">{clients.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">IRIS Clients</p>
                <p className="text-2xl font-bold text-green-600">
                  {clients.filter(c => c.type === 'IRIS').length}
                </p>
              </div>
              <Building className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">SECP Clients</p>
                <p className="text-2xl font-bold text-purple-600">
                  {clients.filter(c => c.type === 'SECP').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-orange-600">
                  {clients.filter(c => 
                    format(c.createdAt, 'yyyy-MM') === format(new Date(), 'yyyy-MM')
                  ).length}
                </p>
              </div>
              <User className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, CNIC, phone, or email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="IRIS">IRIS</option>
              <option value="SECP">SECP</option>
              <option value="PRA">PRA</option>
              <option value="Other">Other</option>
            </select>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4 mr-2" />
              Showing {filteredClients.length} of {clients.length} clients
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{client.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">CNIC: {client.cnic}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {client.phone && (
                        <p className="text-gray-900 dark:text-white flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </p>
                      )}
                      {client.email && (
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </p>
                      )}
                      {!client.phone && !client.email && (
                        <p className="text-gray-400">No contact info</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
                      client.type === 'IRIS' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700' :
                      client.type === 'SECP' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700' :
                      client.type === 'PRA' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                    }`}>
                      {client.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {format(client.createdAt, 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewProfile(client)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                        title="View Full Profile"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
                        title="Edit Client"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id, client.name)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                        title="Delete Client"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No clients found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {clients.length === 0
                  ? "Create your first client to get started"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                <Plus size={20} />
                Create Client
              </button>
            </div>
          )}
        </div>
      </div>

      <ClientFormModal
        show={showForm}
        onClose={() => {
          setShowForm(false);
          onCloseForm?.();
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingClient={editingClient}
        resetForm={resetForm}
      />
    </>
  );
}