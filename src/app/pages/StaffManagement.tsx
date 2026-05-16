import { useState } from 'react';
import { useData, DataRecord } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffManagement() {
  const { records, submitRequest, pendingRequests } = useData();
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DataRecord | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });

  const categories = [
    'Marine Conservation',
    'Natural Heritage',
    'Biodiversity',
    'Wildlife Protection',
    'Coastal Management',
  ];

  const myPendingRequests = pendingRequests.filter(
    (req) => req.submittedBy === user?.id && req.status === 'pending'
  );

  const handleCreate = () => {
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all fields');
      return;
    }

    submitRequest('create', formData);
    toast.success('Request submitted for admin approval');
    setFormData({ title: '', description: '', category: '' });
    setIsCreateOpen(false);
  };

  const handleEdit = () => {
    if (!selectedRecord || !formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all fields');
      return;
    }

    submitRequest('update', formData, selectedRecord.id, selectedRecord);
    toast.success('Update request submitted for admin approval');
    setFormData({ title: '', description: '', category: '' });
    setIsEditOpen(false);
    setSelectedRecord(null);
  };

  const handleDelete = () => {
    if (!selectedRecord) return;

    submitRequest('delete', {}, selectedRecord.id, selectedRecord);
    toast.success('Delete request submitted for admin approval');
    setIsDeleteOpen(false);
    setSelectedRecord(null);
  };

  const openEditDialog = (record: DataRecord) => {
    setSelectedRecord(record);
    setFormData({
      title: record.title,
      description: record.description,
      category: record.category,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (record: DataRecord) => {
    setSelectedRecord(record);
    setIsDeleteOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
            <p className="mt-2 text-gray-600">
              Submit requests to add, edit, or remove data. All changes require admin approval.
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request to Add New Record</DialogTitle>
                <DialogDescription>
                  This will be submitted to admin for approval before being added to the database.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Title</Label>
                  <Input
                    id="create-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="create-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Textarea
                    id="create-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {myPendingRequests.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-900">Pending Requests</h3>
                <p className="text-sm text-yellow-700">
                  You have {myPendingRequests.length} request{myPendingRequests.length !== 1 ? 's' : ''}{' '}
                  awaiting admin approval
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <Card key={record.id} className="p-6">
              <div className="mb-4">
                <div className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  {record.category}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{record.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => openEditDialog(record)}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => openDeleteDialog(record)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request to Update Record</DialogTitle>
              <DialogDescription>
                This will be submitted to admin for approval before being updated in the database.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedRecord(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request to Delete Record</DialogTitle>
              <DialogDescription>
                This will be submitted to admin for approval before being removed from the database.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to request deletion of <strong>{selectedRecord?.title}</strong>?
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedRecord(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Submit Delete Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
