import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export default function PublicData() {
  const { records } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(records.map((r) => r.category)))];

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Conservation Data</h1>
          <p className="mt-2 text-gray-600">
            Browse approved marine protected areas and conservation sites
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredRecords.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="font-semibold text-gray-900">No records found</h3>
            <p className="mt-2 text-sm text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="p-6">
                <div className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  {record.category}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{record.description}</p>
                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  Last updated: {new Date(record.updatedAt).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium">Viewing {filteredRecords.length} approved record{filteredRecords.length !== 1 ? 's' : ''}</p>
          <p className="mt-1 text-blue-700">All data shown has been verified and approved by administrators</p>
        </div>
      </div>
    </div>
  );
}
