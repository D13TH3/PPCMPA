import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { mockMPAs, mockEffectivenessData } from '../data/mockData';
import { 
  FileText, 
  Download, 
  Printer,
  MapPin,
  Calendar,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

export function Reports() {
  const [selectedMpa, setSelectedMpa] = useState(mockMPAs[0].id);
  const selectedMpaData = mockMPAs.find(m => m.id === selectedMpa);
  const effectivenessData = mockEffectivenessData.find(e => e.mpaId === selectedMpa);

  const handleDownload = (reportType: string) => {
    toast.success(`Downloading ${reportType} report...`, {
      description: 'Report will be saved as PDF'
    });
  };

  const exportAnalyticsSummary = () => {
    // Generate analytics summary CSV for all MPAs
    const headers = ['MPA Name', 'Barangay', 'Type', 'Area (ha)', 'Ordinance', 'Date Established', 'Overall Effectiveness (%)', 'Management (%)', 'Enforcement (%)', 'Community (%)', 'Ecological (%)'];

    const rows = mockMPAs.map(mpa => {
      const effectiveness = mockEffectivenessData.find(e => e.mpaId === mpa.id);
      return [
        mpa.name,
        mpa.barangay,
        mpa.type,
        mpa.area,
        mpa.ordinanceNumber,
        mpa.dateEstablished,
        effectiveness?.overall.toFixed(1) || '',
        effectiveness?.scores.management || '',
        effectiveness?.scores.enforcement || '',
        effectiveness?.scores.community || '',
        effectiveness?.scores.ecological || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-summary-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Analytics summary exported successfully');
  };

  const exportMPAData = () => {
    // Generate detailed MPA data CSV
    const headers = ['MPA ID', 'Name', 'Barangay', 'Type', 'Area (ha)', 'Mangrove (ha)', 'Seagrass (ha)', 'Coral Reef (ha)', 'Ordinance', 'Date Established', 'Status', 'Boundary Points'];

    const rows = mockMPAs.map(mpa => [
      mpa.id,
      mpa.name,
      mpa.barangay,
      mpa.type,
      mpa.area,
      mpa.ecosystems.mangrove,
      mpa.ecosystems.seagrass,
      mpa.ecosystems.coralReef,
      mpa.ordinanceNumber,
      mpa.dateEstablished,
      mpa.status,
      mpa.coordinates.length
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mpa-operational-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('MPA operational data exported successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate technical description
  const generateTechnicalDescription = () => {
    if (!selectedMpaData) return '';
    
    const coords = selectedMpaData.coordinates;
    let description = `The ${selectedMpaData.name} is located in Barangay ${selectedMpaData.barangay}, `;
    description += `Puerto Princesa City, Palawan. This ${selectedMpaData.type.replace('-', ' ')} zone encompasses `;
    description += `approximately ${selectedMpaData.area} hectares of marine and coastal area.\n\n`;
    description += `GEOGRAPHICAL COORDINATES:\n`;
    coords.forEach((coord, i) => {
      description += `Point ${i + 1}: ${coord[0].toFixed(6)}°N, ${coord[1].toFixed(6)}°E\n`;
    });
    description += `\nThe area contains the following critical habitats:\n`;
    description += `- Mangrove forests: ${selectedMpaData.ecosystems.mangrove} hectares\n`;
    description += `- Seagrass meadows: ${selectedMpaData.ecosystems.seagrass} hectares\n`;
    description += `- Coral reef systems: ${selectedMpaData.ecosystems.coralReef} hectares\n\n`;
    description += `Established through City Ordinance ${selectedMpaData.ordinanceNumber} on ${selectedMpaData.dateEstablished}, `;
    description += `this protected area serves as a critical component of Puerto Princesa's marine conservation network.`;
    
    return description;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Automated Spatial Reports
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Generate technical descriptions and area reports
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={exportAnalyticsSummary} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </Button>
          <Button variant="outline" onClick={exportMPAData} className="w-full sm:w-auto">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export MPA Data</span>
            <span className="sm:hidden">MPA Data</span>
          </Button>
          <Button variant="outline" onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* MPA Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select MPA for Report Generation</CardTitle>
          <CardDescription>Choose a protected area to generate comprehensive reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedMpa} onValueChange={setSelectedMpa}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockMPAs.map(mpa => (
                <SelectItem key={mpa.id} value={mpa.id}>
                  {mpa.name} - {mpa.barangay} ({mpa.area} ha)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Technical Description</CardTitle>
            <CardDescription>Legal boundaries and coordinates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleDownload('Technical Description')}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-teal-500">
          <CardHeader>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
            <CardTitle>Effectiveness Report</CardTitle>
            <CardDescription>Management performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleDownload('Effectiveness Report')}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-500">
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Ecosystem Inventory</CardTitle>
            <CardDescription>Habitat coverage summary</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleDownload('Ecosystem Inventory')}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      <Tabs defaultValue="technical" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="technical">Technical Description</TabsTrigger>
          <TabsTrigger value="summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="data">Data Tables</TabsTrigger>
        </TabsList>

        {/* Technical Description */}
        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Technical Description Report</CardTitle>
                  <CardDescription>{selectedMpaData?.name}</CardDescription>
                </div>
                <Badge variant="secondary">
                  Generated: {new Date().toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Header */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedMpaData?.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-600">Ordinance</p>
                        <p className="font-semibold">{selectedMpaData?.ordinanceNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Type</p>
                        <p className="font-semibold capitalize">{selectedMpaData?.type.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Barangay</p>
                        <p className="font-semibold">{selectedMpaData?.barangay}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Area</p>
                        <p className="font-semibold">{selectedMpaData?.area} ha</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Description Text */}
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">TECHNICAL DESCRIPTION</h4>
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                  {generateTechnicalDescription()}
                </pre>
              </div>

              {/* Boundary Coordinates Table */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">BOUNDARY COORDINATES</h4>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Point</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Latitude</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Longitude</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Decimal Degrees</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedMpaData?.coordinates.map((coord, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">Point {i + 1}</td>
                          <td className="px-4 py-3 font-mono text-sm">{coord[0].toFixed(6)}°N</td>
                          <td className="px-4 py-3 font-mono text-sm">{coord[1].toFixed(6)}°E</td>
                          <td className="px-4 py-3 font-mono text-sm">
                            {coord[0].toFixed(6)}, {coord[1].toFixed(6)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ecosystem Summary */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">ECOSYSTEM COMPOSITION</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="font-semibold">Mangrove Forests</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedMpaData?.ecosystems.mangrove} ha
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {((selectedMpaData?.ecosystems.mangrove || 0) / (selectedMpaData?.area || 1) * 100).toFixed(1)}% of MPA
                    </p>
                  </div>

                  <div className="p-4 bg-teal-50 border-2 border-teal-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                      <span className="font-semibold">Seagrass Meadows</span>
                    </div>
                    <p className="text-2xl font-bold text-teal-600">
                      {selectedMpaData?.ecosystems.seagrass} ha
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {((selectedMpaData?.ecosystems.seagrass || 0) / (selectedMpaData?.area || 1) * 100).toFixed(1)}% of MPA
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                      <span className="font-semibold">Coral Reefs</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedMpaData?.ecosystems.coralReef} ha
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {((selectedMpaData?.ecosystems.coralReef || 0) / (selectedMpaData?.area || 1) * 100).toFixed(1)}% of MPA
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Executive Summary */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>Comprehensive overview of {selectedMpaData?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">BASIC INFORMATION</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">MPA Name:</span>
                      <span className="font-semibold">{selectedMpaData?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold">Brgy. {selectedMpaData?.barangay}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Classification:</span>
                      <span className="font-semibold capitalize">{selectedMpaData?.type.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Total Area:</span>
                      <span className="font-semibold">{selectedMpaData?.area} hectares</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Legal Basis:</span>
                      <span className="font-semibold">{selectedMpaData?.ordinanceNumber}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Date Established:</span>
                      <span className="font-semibold">{selectedMpaData?.dateEstablished}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="default">{selectedMpaData?.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">MANAGEMENT EFFECTIVENESS</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Overall Score:</span>
                      <span className="font-bold text-blue-600">{effectivenessData?.overall.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Management:</span>
                      <span className="font-semibold">{effectivenessData?.scores.management}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Enforcement:</span>
                      <span className="font-semibold">{effectivenessData?.scores.enforcement}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Community:</span>
                      <span className="font-semibold">{effectivenessData?.scores.community}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Ecological:</span>
                      <span className="font-semibold">{effectivenessData?.scores.ecological}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Assessment Period:</span>
                      <span className="font-semibold">Q{effectivenessData?.quarter} {effectivenessData?.year}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">KEY HIGHLIGHTS</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Protects {((selectedMpaData?.ecosystems.mangrove || 0) + (selectedMpaData?.ecosystems.seagrass || 0) + (selectedMpaData?.ecosystems.coralReef || 0)).toFixed(1)} hectares of critical marine habitats</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Management effectiveness rated at {effectivenessData?.overall.toFixed(1)}%, indicating strong governance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Established through legitimate legal framework ({selectedMpaData?.ordinanceNumber})</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <span>Contributes to Puerto Princesa's marine biodiversity conservation goals</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tables */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Data Tables</CardTitle>
              <CardDescription>Detailed metrics and measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">SPATIAL DATA</h4>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Metric</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Value</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3">Total MPA Area</td>
                        <td className="px-4 py-3 font-semibold">{selectedMpaData?.area}</td>
                        <td className="px-4 py-3">hectares</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Mangrove Coverage</td>
                        <td className="px-4 py-3 font-semibold">{selectedMpaData?.ecosystems.mangrove}</td>
                        <td className="px-4 py-3">hectares</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Seagrass Coverage</td>
                        <td className="px-4 py-3 font-semibold">{selectedMpaData?.ecosystems.seagrass}</td>
                        <td className="px-4 py-3">hectares</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Coral Reef Coverage</td>
                        <td className="px-4 py-3 font-semibold">{selectedMpaData?.ecosystems.coralReef}</td>
                        <td className="px-4 py-3">hectares</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Number of Boundary Points</td>
                        <td className="px-4 py-3 font-semibold">{selectedMpaData?.coordinates.length}</td>
                        <td className="px-4 py-3">points</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">PERFORMANCE METRICS (Q4 2025)</h4>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Criterion</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Score</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3">Management Planning</td>
                        <td className="px-4 py-3 font-semibold">{effectivenessData?.scores.management}%</td>
                        <td className="px-4 py-3">
                          <Badge variant="default">
                            {(effectivenessData?.scores.management || 0) >= 85 ? 'Excellent' : 'Good'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Law Enforcement</td>
                        <td className="px-4 py-3 font-semibold">{effectivenessData?.scores.enforcement}%</td>
                        <td className="px-4 py-3">
                          <Badge variant="default">
                            {(effectivenessData?.scores.enforcement || 0) >= 85 ? 'Excellent' : 'Good'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Community Participation</td>
                        <td className="px-4 py-3 font-semibold">{effectivenessData?.scores.community}%</td>
                        <td className="px-4 py-3">
                          <Badge variant="default">
                            {(effectivenessData?.scores.community || 0) >= 85 ? 'Excellent' : 'Good'}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Ecological Condition</td>
                        <td className="px-4 py-3 font-semibold">{effectivenessData?.scores.ecological}%</td>
                        <td className="px-4 py-3">
                          <Badge variant="default">
                            {(effectivenessData?.scores.ecological || 0) >= 85 ? 'Excellent' : 'Good'}
                          </Badge>
                        </td>
                      </tr>
                      <tr className="bg-gray-50 font-bold">
                        <td className="px-4 py-3">Overall Effectiveness</td>
                        <td className="px-4 py-3 text-blue-600">{effectivenessData?.overall.toFixed(1)}%</td>
                        <td className="px-4 py-3">
                          <Badge variant="default">
                            {(effectivenessData?.overall || 0) >= 85 ? 'Excellent' : 'Good'}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
