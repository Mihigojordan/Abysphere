/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Plus, AlertCircle, Package, Cookie, Bath, Droplets, Syringe, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { type Cage } from '../../../../services/cageService';
import medicationService, { type Medication } from '../../../../services/medicationService';

interface MedicationsTabProps {
  cage: Cage;
  medications: Medication[];
  setMedications: React.Dispatch<React.SetStateAction<Medication[]>>;
  role: string;
}

const MedicationsTab: React.FC<MedicationsTabProps> = ({ cage, medications, setMedications, role }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Africa/Harare', // CAT (UTC+2)
    });
  };

  const getMethodIcon = (method: string | undefined) => {
    switch (method) {
      case 'FEED':
        return <Cookie className="w-4 h-4" />;
      case 'BATH':
        return <Bath className="w-4 h-4" />;
      case 'WATER':
        return <Droplets className="w-4 h-4" />;
      case 'INJECTION':
        return <Syringe className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getMedicationStatus = (startDate: string | undefined, endDate: string | null | undefined) => {
    const now = new Date('2025-09-27T10:44:00+02:00'); // 10:44 AM CAT, September 27, 2025
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (!start) {
      return { status: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
    if (now < start) {
      return { status: 'Scheduled', color: 'bg-primary-100 text-primary-800' };
    } else if (!end || now <= end) {
      return { status: 'Active', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'Completed', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const activeMedications = medications.filter(med => {
    const now = new Date('2025-09-27T10:44:00+02:00'); // 10:44 AM CAT, September 27, 2025
    const start = med.startDate ? new Date(med.startDate) : null;
    const end = med.endDate ? new Date(med.endDate) : null;
    return start && now >= start && (!end || now <= end);
  });

  const handleDelete = async (medicationId: string) => {
    try {
      await medicationService.deleteMedication(medicationId);
      setMedications(medications.filter(med => med.id !== medicationId));
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Medication deleted successfully',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error: any) {
      console.error('Error deleting medication:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to delete medication',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medication Management</h2>
          <p className="text-sm text-gray-600">Manage medications for {cage.cageName}</p>
        </div>
        <button
          onClick={() => navigate(`/${role}/dashboard/cage-management/m/create?cageId=${cage.id}`)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Active Medications Alert */}
      {activeMedications.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">
              {activeMedications.length} active medication{activeMedications.length > 1 ? 's' : ''} in progress
            </span>
          </div>
        </div>
      )}

      {/* Medications List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administered By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medications.map((medication) => {
                const medStatus = getMedicationStatus(medication.startDate, medication.endDate);
                return (
                  <tr key={medication.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{medication.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{medication.dosage}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(medication.method)}
                        <span className="text-sm text-gray-900">{medication.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{medication.reason || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div>Start: {formatDate(medication.startDate)}</div>
                        <div>End: {medication.endDate ? formatDate(medication.endDate) : 'Ongoing'}</div>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${medStatus.color}`}>
                        {medStatus.status}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {medication.employee
                        ? `${medication.employee.first_name} ${medication.employee.last_name}`
                        : medication.admin?.adminName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/${role}/dashboard/cage-management/m/update/${medication.id}?cageId=${cage.id}`)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(medication.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {medications.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No medications recorded for this cage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicationsTab;