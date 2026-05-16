import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { mockOrdinances, mockMPAs, Ordinance } from '../data/mockData';
import { 
  ScrollText, 
  Search,
  FileText,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Filter
} from 'lucide-react';

export function Ordinances() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'amended' | 'repealed'>('all');
  
  const filteredOrdinances = mockOrdinances.filter(ord => {
    const matchesSearch = ord.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ord.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ord.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = mockOrdinances.filter(o => o.status === 'active').length;
  const amendedCount = mockOrdinances.filter(o => o.status === 'amended').length;
  const repealedCount = mockOrdinances.filter(o => o.status === 'repealed').length;

  const getStatusBadge = (status: Ordinance['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Active</Badge>;
      case 'amended':
        return <Badge variant="secondary">Amended</Badge>;
      case 'repealed':
        return <Badge variant="destructive">Repealed</Badge>;
    }
  };

  const getStatusIcon = (status: Ordinance['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'amended':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'repealed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Legal Ordinances Repository
        </h2>
        <p className="text-gray-600 mt-1">
          Digitized city ordinances establishing and governing MPAs
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardDescription>Total Ordinances</CardDescription>
            <CardTitle className="text-3xl">{mockOrdinances.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Legal documents digitized</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-3">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl text-green-600">{activeCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Currently in effect</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardHeader className="pb-3">
            <CardDescription>Amended</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{amendedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Modified ordinances</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="pb-3">
            <CardDescription>Repealed</CardDescription>
            <CardTitle className="text-3xl text-red-600">{repealedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">No longer active</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by ordinance number, title, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'amended' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('amended')}
              >
                Amended
              </Button>
              <Button
                variant={statusFilter === 'repealed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('repealed')}
              >
                Repealed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ordinances List */}
      <div className="space-y-4">
        {filteredOrdinances.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No ordinances found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrdinances.map((ordinance) => {
            const linkedMpa = mockMPAs.find(mpa => mpa.id === ordinance.mpaId);
            
            return (
              <Card key={ordinance.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ScrollText className="w-6 h-6 text-blue-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {ordinance.number}
                            </h3>
                            {getStatusBadge(ordinance.status)}
                          </div>
                          <h4 className="text-lg text-gray-700 mb-3">{ordinance.title}</h4>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {ordinance.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Enacted: {ordinance.dateEnacted}</span>
                        </div>
                        
                        {linkedMpa && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>Applies to: {linkedMpa.name}</span>
                          </div>
                        )}
                      </div>

                      {linkedMpa && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Linked MPA Details:</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-gray-600">Area</p>
                              <p className="font-semibold">{linkedMpa.area} ha</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Type</p>
                              <p className="font-semibold capitalize">{linkedMpa.type.replace('-', ' ')}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Barangay</p>
                              <p className="font-semibold">{linkedMpa.barangay}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Status</p>
                              <Badge variant="secondary">{linkedMpa.status}</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Timeline View */}
      <Card>
        <CardHeader>
          <CardTitle>Ordinance Timeline</CardTitle>
          <CardDescription>Chronological view of MPA-related legislation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-8">
              {mockOrdinances
                .sort((a, b) => new Date(b.dateEnacted).getTime() - new Date(a.dateEnacted).getTime())
                .map((ordinance, index) => (
                  <div key={ordinance.id} className="relative pl-16">
                    {/* Timeline dot */}
                    <div className="absolute left-3.5 top-1 w-5 h-5 rounded-full bg-white border-4 border-blue-600 z-10"></div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-blue-600">{ordinance.number}</span>
                            {getStatusBadge(ordinance.status)}
                          </div>
                          <p className="font-semibold text-gray-900">{ordinance.title}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{ordinance.summary}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(ordinance.dateEnacted).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Notice */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">From Text to Map</h4>
              <p className="text-sm text-blue-800 mb-3">
                This system digitizes physical ordinances into legally-accurate digital boundaries. 
                Each ordinance is linked to its corresponding MPA, ensuring that legal policies are 
                directly connected to spatial data for transparent governance.
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Legal documents are preserved in digital format</li>
                <li>• Boundaries are plotted based on ordinance descriptions</li>
                <li>• Changes in legislation automatically update the map</li>
                <li>• Full traceability from law to geographic coordinates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
