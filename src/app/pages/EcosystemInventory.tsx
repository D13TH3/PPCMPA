import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { mockMPAs } from '../data/mockData';
import { 
  Trees, 
  Leaf, 
  Waves, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Ecosystem Inventory Component - Updated with unique chart keys
export function EcosystemInventory() {
  const [selectedHabitat, setSelectedHabitat] = useState<'mangrove' | 'seagrass' | 'coralReef'>('mangrove');

  // Calculate totals
  const totalMangrove = mockMPAs.reduce((sum, mpa) => sum + mpa.ecosystems.mangrove, 0);
  const totalSeagrass = mockMPAs.reduce((sum, mpa) => sum + mpa.ecosystems.seagrass, 0);
  const totalCoralReef = mockMPAs.reduce((sum, mpa) => sum + mpa.ecosystems.coralReef, 0);
  const totalEcosystem = totalMangrove + totalSeagrass + totalCoralReef;

  // Data by MPA
  const ecosystemByMpa = mockMPAs.map(mpa => ({
    name: mpa.name.split(' ')[0],
    fullName: mpa.name,
    mangrove: mpa.ecosystems.mangrove,
    seagrass: mpa.ecosystems.seagrass,
    coralReef: mpa.ecosystems.coralReef,
    total: mpa.ecosystems.mangrove + mpa.ecosystems.seagrass + mpa.ecosystems.coralReef
  }));

  // Overall distribution
  const distributionData = [
    { name: 'Mangrove', value: totalMangrove, color: '#16a34a', id: 'dist-mangrove' },
    { name: 'Seagrass', value: totalSeagrass, color: '#14b8a6', id: 'dist-seagrass' },
    { name: 'Coral Reef', value: totalCoralReef, color: '#f97316', id: 'dist-coral' },
  ];

  // Trend data (mock historical data)
  const trendData = [
    { year: '2020', mangrove: totalMangrove * 0.85, seagrass: totalSeagrass * 0.88, coralReef: totalCoralReef * 0.90 },
    { year: '2021', mangrove: totalMangrove * 0.89, seagrass: totalSeagrass * 0.91, coralReef: totalCoralReef * 0.93 },
    { year: '2022', mangrove: totalMangrove * 0.92, seagrass: totalSeagrass * 0.94, coralReef: totalCoralReef * 0.95 },
    { year: '2023', mangrove: totalMangrove * 0.95, seagrass: totalSeagrass * 0.96, coralReef: totalCoralReef * 0.97 },
    { year: '2024', mangrove: totalMangrove * 0.98, seagrass: totalSeagrass * 0.98, coralReef: totalCoralReef * 0.99 },
    { year: '2025', mangrove: totalMangrove, seagrass: totalSeagrass, coralReef: totalCoralReef },
  ];

  const habitatInfo = {
    mangrove: {
      icon: Trees,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      title: 'Mangrove Forests',
      description: 'Critical coastal ecosystems providing nursery habitat and storm protection',
      threats: ['Coastal development', 'Illegal cutting', 'Pollution'],
      services: ['Carbon sequestration', 'Fish nursery', 'Coastal protection', 'Water filtration']
    },
    seagrass: {
      icon: Leaf,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      title: 'Seagrass Meadows',
      description: 'Underwater flowering plants supporting diverse marine life and dugongs',
      threats: ['Sedimentation', 'Boat anchoring', 'Water quality degradation'],
      services: ['Oxygen production', 'Habitat provision', 'Sediment stabilization', 'Carbon storage']
    },
    coralReef: {
      icon: Waves,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      title: 'Coral Reefs',
      description: 'Biodiversity hotspots supporting thousands of marine species',
      threats: ['Overfishing', 'Climate change', 'Destructive fishing', 'Crown-of-thorns starfish'],
      services: ['Biodiversity support', 'Tourism value', 'Fisheries production', 'Wave attenuation']
    }
  };

  const selectedInfo = habitatInfo[selectedHabitat];
  const SelectedIcon = selectedInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Ecosystem Inventory
        </h2>
        <p className="text-gray-600 mt-1">
          Comprehensive habitat assessment across all MPAs
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-gray-600">
          <CardHeader className="pb-3">
            <CardDescription>Total Ecosystem Area</CardDescription>
            <CardTitle className="text-3xl">{totalEcosystem.toFixed(1)} ha</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={100} className="h-2" />
            <p className="text-xs text-gray-600 mt-2">Across 6 MPAs</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-3">
            <CardDescription>Mangrove Forests</CardDescription>
            <CardTitle className="text-3xl">{totalMangrove.toFixed(1)} ha</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(totalMangrove / totalEcosystem) * 100} className="h-2" />
            <p className="text-xs text-gray-600 mt-2">
              {((totalMangrove / totalEcosystem) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-600">
          <CardHeader className="pb-3">
            <CardDescription>Seagrass Meadows</CardDescription>
            <CardTitle className="text-3xl">{totalSeagrass.toFixed(1)} ha</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(totalSeagrass / totalEcosystem) * 100} className="h-2" />
            <p className="text-xs text-gray-600 mt-2">
              {((totalSeagrass / totalEcosystem) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardHeader className="pb-3">
            <CardDescription>Coral Reefs</CardDescription>
            <CardTitle className="text-3xl">{totalCoralReef.toFixed(1)} ha</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(totalCoralReef / totalEcosystem) * 100} className="h-2" />
            <p className="text-xs text-gray-600 mt-2">
              {((totalCoralReef / totalEcosystem) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Habitat Distribution</CardTitle>
            <CardDescription>Proportion of each ecosystem type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Coverage by MPA */}
        <Card>
          <CardHeader>
            <CardTitle>Ecosystem Coverage by MPA</CardTitle>
            <CardDescription>Total habitat area per protected area</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ecosystemByMpa}>
                <CartesianGrid strokeDasharray="3 3" key="grid-bar" />
                <XAxis dataKey="name" key="xaxis-bar" />
                <YAxis key="yaxis-bar" />
                <Tooltip key="tooltip-bar" />
                <Legend key="legend-bar" />
                <Bar dataKey="mangrove" stackId="a" fill="#16a34a" name="Mangrove" key="bar-mangrove" />
                <Bar dataKey="seagrass" stackId="a" fill="#14b8a6" name="Seagrass" key="bar-seagrass" />
                <Bar dataKey="coralReef" stackId="a" fill="#f97316" name="Coral Reef" key="bar-coral" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Historical Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Habitat Coverage Trends (2020-2025)</CardTitle>
          <CardDescription>Growth in protected ecosystem areas over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" key="grid-line" />
              <XAxis dataKey="year" key="xaxis-line" />
              <YAxis key="yaxis-line" />
              <Tooltip key="tooltip-line" />
              <Legend key="legend-line" />
              <Line type="monotone" dataKey="mangrove" stroke="#16a34a" strokeWidth={2} name="Mangrove (ha)" key="line-mangrove" />
              <Line type="monotone" dataKey="seagrass" stroke="#14b8a6" strokeWidth={2} name="Seagrass (ha)" key="line-seagrass" />
              <Line type="monotone" dataKey="coralReef" stroke="#f97316" strokeWidth={2} name="Coral Reef (ha)" key="line-coral" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Habitat Information */}
      <Card>
        <CardHeader>
          <CardTitle>Habitat Details</CardTitle>
          <CardDescription>In-depth ecosystem information and ecosystem services</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedHabitat} onValueChange={(v) => setSelectedHabitat(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mangrove">
                <Trees className="w-4 h-4 mr-2" />
                Mangrove
              </TabsTrigger>
              <TabsTrigger value="seagrass">
                <Leaf className="w-4 h-4 mr-2" />
                Seagrass
              </TabsTrigger>
              <TabsTrigger value="coralReef">
                <Waves className="w-4 h-4 mr-2" />
                Coral Reef
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedHabitat} className="mt-6">
              <div className={`p-6 rounded-lg border-2 ${selectedInfo.borderColor} ${selectedInfo.bgColor}`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-lg bg-white`}>
                    <SelectedIcon className={`w-8 h-8 ${selectedInfo.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedInfo.title}</h3>
                    <p className="text-gray-700">{selectedInfo.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Ecosystem Services
                    </h4>
                    <ul className="space-y-2">
                      {selectedInfo.services.map((service, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Primary Threats
                    </h4>
                    <ul className="space-y-2">
                      {selectedInfo.threats.map((threat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-sm">{threat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Coverage Across MPAs</h4>
                  <div className="space-y-3">
                    {mockMPAs
                      .sort((a, b) => b.ecosystems[selectedHabitat] - a.ecosystems[selectedHabitat])
                      .map((mpa) => (
                        <div key={mpa.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{mpa.name}</span>
                            <span className={`text-sm font-bold ${selectedInfo.color}`}>
                              {mpa.ecosystems[selectedHabitat].toFixed(1)} ha
                            </span>
                          </div>
                          <Progress 
                            value={(mpa.ecosystems[selectedHabitat] / (selectedHabitat === 'mangrove' ? totalMangrove : selectedHabitat === 'seagrass' ? totalSeagrass : totalCoralReef)) * 100}
                            className="h-2"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed MPA Ecosystem Breakdown</CardTitle>
          <CardDescription>Complete inventory of habitats by protected area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">MPA Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Barangay</th>
                  <th className="text-right py-3 px-4 font-semibold">Mangrove</th>
                  <th className="text-right py-3 px-4 font-semibold">Seagrass</th>
                  <th className="text-right py-3 px-4 font-semibold">Coral Reef</th>
                  <th className="text-right py-3 px-4 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {ecosystemByMpa.map((mpa, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{mpa.fullName}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {mockMPAs.find(m => m.name === mpa.fullName)?.barangay}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">
                      {mpa.mangrove.toFixed(1)} ha
                    </td>
                    <td className="py-3 px-4 text-right text-teal-600 font-medium">
                      {mpa.seagrass.toFixed(1)} ha
                    </td>
                    <td className="py-3 px-4 text-right text-orange-600 font-medium">
                      {mpa.coralReef.toFixed(1)} ha
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      {mpa.total.toFixed(1)} ha
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200 font-bold bg-gray-50">
                  <td className="py-3 px-4" colSpan={2}>TOTAL</td>
                  <td className="py-3 px-4 text-right text-green-600">
                    {totalMangrove.toFixed(1)} ha
                  </td>
                  <td className="py-3 px-4 text-right text-teal-600">
                    {totalSeagrass.toFixed(1)} ha
                  </td>
                  <td className="py-3 px-4 text-right text-orange-600">
                    {totalCoralReef.toFixed(1)} ha
                  </td>
                  <td className="py-3 px-4 text-right">
                    {totalEcosystem.toFixed(1)} ha
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}