import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  Shield,
  Users,
  Eye,
  FileText,
  Plus,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  Calendar,
  BarChart3,
  X
} from 'lucide-react';

interface EmployeePermissionsModalProps {
  show: boolean;
  onClose: () => void;
  employee: any;
  currentPermissions: any;
  onSave: (permissions: any) => void;
}

export const EmployeePermissionsModal: React.FC<EmployeePermissionsModalProps> = ({
  show,
  onClose,
  employee,
  currentPermissions,
  onSave
}) => {
  const [permissions, setPermissions] = useState({
    canViewClientCredentials: false,
    requiresApprovalForCredentials: true,
    canViewAllClients: true,
    canCreateReceipts: true,
    canEditReceipts: false,
    canDeleteReceipts: false,
    canViewReports: false,
    canViewExpenses: false,
    canCreateExpenses: false,
    workingHours: { start: '09:00', end: '17:00' },
    lateThresholdMinutes: 15,
    requiresReasonForLate: true,
    canViewOtherEmployees: false,
    canViewAttendanceReports: false,
    ...currentPermissions
  });

  if (!show) return null;

  const handleSave = () => {
    onSave(permissions);
    onClose();
  };

  const PermissionToggle: React.FC<{
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon?: React.ElementType;
  }> = ({ label, description, checked, onChange, icon: Icon }) => (
    <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 mb-2">
      <div className="flex items-start gap-3">
        {Icon && <Icon className="w-5 h-5 text-blue-600 mt-0.5" />}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200/20 dark:border-gray-700/30"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Permissions: {employee?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure access and controls for this employee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-2xl transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Client Access Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Client Access Permissions
            </h3>
            <div>
              <PermissionToggle
                label="View Client Credentials"
                description="Allow direct access to client passwords and sensitive information"
                checked={permissions.canViewClientCredentials}
                onChange={checked => setPermissions((prev: any) => ({ ...prev, canViewClientCredentials: checked }))}
                icon={Eye}
              />
              <PermissionToggle
                label="Require Approval for Credentials"
                description="Employee must request approval before accessing client credentials"
                checked={permissions.requiresApprovalForCredentials}
                onChange={checked => setPermissions((prev: any) => ({ ...prev, requiresApprovalForCredentials: checked }))}
                icon={Shield}
              />
              <PermissionToggle
                label="View All Clients"
                description="Access to view all client profiles and information"
                checked={permissions.canViewAllClients}
                onChange={checked => setPermissions((prev: any) => ({ ...prev, canViewAllClients: checked }))}
                icon={Users}
              />
            </div>
          </div>

          {/* Receipt Permissions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Receipt Management
            </h3>
            <div>
              <PermissionToggle
                label="Create Receipts"
                description="Allow creating new receipts for clients"
                checked={permissions.canCreateReceipts}
                onChange={checked => setPermissions((prev: any) => ({ ...prev, canCreateReceipts: checked }))}
                icon={Plus}
              />
              <PermissionToggle
                label="Edit Receipts"
                description="Allow editing existing receipts"
                checked={permissions.canEditReceipts}
                onChange={checked => setPermissions((prev: any) => ({ ...prev, canEditReceipts: checked }))}
                icon={Edit}
              />
              <PermissionToggle
                label="Delete Receipts"
                description="Allow deleting receipts (high-risk permission)"
                checked={permissions.canDeleteReceipts}
                onChange={checked => setPermissions((prev: any) => ({ ...prev, canDeleteReceipts: checked }))}
                icon={Trash2}
              />
            </div>
          </div>

          {/* Working Hours & Attendance */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Working Hours & Attendance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={permissions.workingHours?.start || '09:00'}
                  onChange={e => setPermissions((prev: { workingHours: any; }) => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={permissions.workingHours?.end || '17:00'}
                  onChange={e => setPermissions((prev: { workingHours: any; }) => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Late Threshold (minutes)
              </label>
              <input
                type="number"
                value={permissions.lateThresholdMinutes || 15}
                onChange={e => setPermissions((prev: any) => ({ ...prev, lateThresholdMinutes: parseInt(e.target.value) || 15 }))}
                min="1"
                max="60"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Employee will be marked as late if they check in after this many minutes
              </p>
            </div>
            <PermissionToggle
              label="Require Reason for Late Arrival"
              description="Employee must provide a reason when checking in late"
              checked={permissions.requiresReasonForLate}
              onChange={checked => setPermissions((prev: any) => ({ ...prev, requiresReasonForLate: checked }))}
              icon={AlertCircle}
            />
          </div>

          {/* System Access */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              System Access
            </h3>
            <div>
              <PermissionToggle
                label="View Reports"
                description="Access to financial reports and analytics"
                checked={permissions.canViewReports}
                onChange={checked => setPermissions((prev: any) => ({ ...prev, canViewReports: checked }))}
                icon={BarChart3}
              />
              <PermissionToggle
                label="View Expenses"
                description="Access to view company expenses"
                checked={permissions.canViewExpenses}
                onChange={checked => setPermissions((prev: any) => ({ ...prev, canViewExpenses: checked }))}
                icon={Eye}
              />
              <PermissionToggle
                label="Create Expenses"
                description="Allow creating new expense entries"
                checked={permissions.canCreateExpenses}
                onChange={checked => setPermissions((prev: any) => ({ ...prev, canCreateExpenses: checked }))}
                icon={Plus}
              />
              <PermissionToggle
                label="View Other Employees"
                description="Access to view other employee information"
                checked={permissions.canViewOtherEmployees}
                onChange={checked => setPermissions((prev: any) => ({ ...prev, canViewOtherEmployees: checked }))}
                icon={Users}
              />
              <PermissionToggle
                label="View Attendance Reports"
                description="Access to attendance reports and analytics"
                checked={permissions.canViewAttendanceReports}
                onChange={checked => setPermissions((prev: any) => ({ ...prev, canViewAttendanceReports: checked }))}
                icon={Calendar}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200/50 dark:border-gray-700/50 rounded-b-3xl">
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.getElementById('modal-root')!);
};
