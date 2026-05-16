import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type RequestAction = 'create' | 'update' | 'delete';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface DataRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingRequest {
  id: string;
  action: RequestAction;
  recordId?: string;
  data: Partial<DataRecord>;
  previousData?: DataRecord;
  status: RequestStatus;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface DataContextType {
  records: DataRecord[];
  pendingRequests: PendingRequest[];
  submitRequest: (action: RequestAction, data: Partial<DataRecord>, recordId?: string, previousData?: DataRecord) => void;
  approveRequest: (requestId: string, reviewerId: string, reviewerName: string) => void;
  rejectRequest: (requestId: string, reviewerId: string, reviewerName: string, reason: string) => void;
  getPendingRequestsCount: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial approved data
const INITIAL_RECORDS: DataRecord[] = [
  {
    id: '1',
    title: 'Tubbataha Reefs Natural Park',
    description: 'Marine protected area in the Sulu Sea',
    category: 'Marine Conservation',
    createdBy: '1',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    title: 'Puerto Princesa Subterranean River',
    description: 'Underground river system and UNESCO World Heritage Site',
    category: 'Natural Heritage',
    createdBy: '1',
    createdAt: '2024-02-10T10:30:00Z',
    updatedAt: '2024-02-10T10:30:00Z',
  },
  {
    id: '3',
    title: 'Cleopatra\'s Needle Critical Habitat',
    description: 'Protected area for endemic species',
    category: 'Biodiversity',
    createdBy: '1',
    createdAt: '2024-03-05T14:15:00Z',
    updatedAt: '2024-03-05T14:15:00Z',
  },
];

// Initial pending requests
const INITIAL_PENDING: PendingRequest[] = [
  {
    id: 'req-1',
    action: 'create',
    data: {
      title: 'Ursula Island Wildlife Sanctuary',
      description: 'Protected habitat for marine turtles and seabirds',
      category: 'Wildlife Protection',
    },
    status: 'pending',
    submittedBy: '2',
    submittedByName: 'Carlos Rivera',
    submittedAt: '2024-04-08T09:20:00Z',
  },
  {
    id: 'req-2',
    action: 'update',
    recordId: '2',
    data: {
      title: 'Puerto Princesa Subterranean River National Park',
      description: 'Underground river system and UNESCO World Heritage Site - expanded protection area',
    },
    previousData: INITIAL_RECORDS[1],
    status: 'pending',
    submittedBy: '2',
    submittedByName: 'Carlos Rivera',
    submittedAt: '2024-04-09T11:45:00Z',
  },
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedRecords = localStorage.getItem('mpa_records');
    const storedPending = localStorage.getItem('mpa_pending');

    if (storedRecords) {
      setRecords(JSON.parse(storedRecords));
    } else {
      setRecords(INITIAL_RECORDS);
      localStorage.setItem('mpa_records', JSON.stringify(INITIAL_RECORDS));
    }

    if (storedPending) {
      setPendingRequests(JSON.parse(storedPending));
    } else {
      setPendingRequests(INITIAL_PENDING);
      localStorage.setItem('mpa_pending', JSON.stringify(INITIAL_PENDING));
    }
  }, []);

  const submitRequest = (
    action: RequestAction,
    data: Partial<DataRecord>,
    recordId?: string,
    previousData?: DataRecord
  ) => {
    if (!user) return;

    const newRequest: PendingRequest = {
      id: `req-${Date.now()}`,
      action,
      recordId,
      data,
      previousData,
      status: 'pending',
      submittedBy: user.id,
      submittedByName: user.name,
      submittedAt: new Date().toISOString(),
    };

    const updated = [...pendingRequests, newRequest];
    setPendingRequests(updated);
    localStorage.setItem('mpa_pending', JSON.stringify(updated));
  };

  const approveRequest = (requestId: string, reviewerId: string, reviewerName: string) => {
    const request = pendingRequests.find((r) => r.id === requestId);
    if (!request) return;

    let updatedRecords = [...records];

    // Apply the change based on action type
    if (request.action === 'create') {
      const newRecord: DataRecord = {
        id: `rec-${Date.now()}`,
        title: request.data.title || '',
        description: request.data.description || '',
        category: request.data.category || '',
        createdBy: request.submittedBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedRecords.push(newRecord);
    } else if (request.action === 'update' && request.recordId) {
      updatedRecords = updatedRecords.map((record) =>
        record.id === request.recordId
          ? { ...record, ...request.data, updatedAt: new Date().toISOString() }
          : record
      );
    } else if (request.action === 'delete' && request.recordId) {
      updatedRecords = updatedRecords.filter((record) => record.id !== request.recordId);
    }

    // Update records
    setRecords(updatedRecords);
    localStorage.setItem('mpa_records', JSON.stringify(updatedRecords));

    // Mark request as approved
    const updatedRequests = pendingRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'approved' as RequestStatus,
            reviewedBy: reviewerId,
            reviewedByName: reviewerName,
            reviewedAt: new Date().toISOString(),
          }
        : r
    );

    setPendingRequests(updatedRequests);
    localStorage.setItem('mpa_pending', JSON.stringify(updatedRequests));
  };

  const rejectRequest = (requestId: string, reviewerId: string, reviewerName: string, reason: string) => {
    const updatedRequests = pendingRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'rejected' as RequestStatus,
            reviewedBy: reviewerId,
            reviewedByName: reviewerName,
            reviewedAt: new Date().toISOString(),
            rejectionReason: reason,
          }
        : r
    );

    setPendingRequests(updatedRequests);
    localStorage.setItem('mpa_pending', JSON.stringify(updatedRequests));
  };

  const getPendingRequestsCount = () => {
    return pendingRequests.filter((r) => r.status === 'pending').length;
  };

  return (
    <DataContext.Provider
      value={{
        records,
        pendingRequests,
        submitRequest,
        approveRequest,
        rejectRequest,
        getPendingRequestsCount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
