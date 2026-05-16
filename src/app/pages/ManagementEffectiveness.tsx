import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { mockMPAs, mockEffectivenessData, historicalEffectiveness } from '../data/mockData';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  FileText,
  Plus
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { toast } from 'sonner';

// Management Effectiveness Component - Updated with unique chart keys
export function ManagementEffectiveness() {
  const [selectedMpa, setSelectedMpa] = useState(mockMPAs[0].id);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [assessmentData, setAssessmentData] = useState({
    management: 75,
    enforcement: 75,
    community: 75,
    ecological: 75,
    notes: ''
  });

  const selectedMpaData = mockMPAs.find(m => m.id === selectedMpa);
  const currentEffectiveness = mockEffectivenessData.find(e => e.mpaId === selectedMpa);
  
  // Calculate average effectiveness
  const avgEffectiveness = mockEffectivenessData.reduce((sum, data) => sum + data.overall, 0) / mockEffectivenessData.length;

  // Prepare radar chart data for selected MPA
  const radarData = currentEffectiveness ? [
    { category: 'Management', score: currentEffectiveness.scores.management, fullMark: 100 },
    { category: 'Enforcement', score: currentEffectiveness.scores.enforcement, fullMark: 100 },
    { category: 'Community', score: currentEffectiveness.scores.community, fullMark: 100 },
    { category: 'Ecological', score: currentEffectiveness.scores.ecological, fullMark: 100 },
  ] : [];

  // Historical data for selected MPA
  const mpaHistory = historicalEffectiveness
    .filter(e => e.mpaId === selectedMpa)
    .concat([currentEffectiveness!])
    .sort((a, b) => a.quarter - b.quarter)
    .map(item => ({
      period: `Q${item.quarter}`,
      overall: item.overall,
      management: item.scores.management,
      enforcement: item.scores.enforcement,
      community: item.scores.community,
      ecological: item.scores.ecological
    }));

  // Comparison data for all MPAs
  const comparisonData = mockEffectivenessData.map(item => ({
    name: item.mpaName.split(' ')[0],
    fullName: item.mpaName,
    score: item.overall
  })).sort((a, b) => b.score - a.score);

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-teal-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number): { variant: 'default' | 'secondary' | 'destructive', label: string } => {
    if (score >= 85) return { variant: 'default', label: 'Excellent' };
    if (score >= 70) return { variant: 'default', label: 'Good' };
    if (score >= 50) return { variant: 'secondary', label: 'Fair' };
    return { variant: 'destructive', label: 'Needs Improvement' };
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const handleSubmitAssessment = () => {
    const overall = (assessmentData.management + assessmentData.enforcement + 
                     assessmentData.community + assessmentData.ecological) / 4;
    
    toast.success('Assessment submitted successfully!', {
      description: `Overall score: ${overall.toFixed(1)}%`
    });
    
    setShowAssessmentForm(false);
    setAssessmentData({
      management: 75,
      enforcement: 75,
      community: 75,
      ecological: 75,
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Management Effectiveness Tracking
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor and evaluate MPA management performance
          </p>
        </div>
        <Button 
          onClick={() => setShowAssessmentForm(!showAssessmentForm)}
          className="bg-gradient-to-r from-blue-600 to-teal-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {/* New Assessment Form */}
      {showAssessmentForm && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle>New Effectiveness Assessment</CardTitle>
            <CardDescription>Q4 2025 - Evaluate management performance across key criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select MPA</Label>
              <Select value={selectedMpa} onValueChange={setSelectedMpa}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockMPAs.map(mpa => (
                    <SelectItem key={mpa.id} value={mpa.id}>
                      {mpa.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Management Planning & Implementation</Label>
                  <span className="font-bold text-blue-600">{assessmentData.management}%</span>
                </div>
                <Slider
                  value={[assessmentData.management]}
                  onValueChange={(v) => setAssessmentData({ ...assessmentData, management: v[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-600">
                  Clarity of objectives, action plans, resource allocation, monitoring systems
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Law Enforcement & Compliance</Label>
                  <span className="font-bold text-teal-600">{assessmentData.enforcement}%</span>
                </div>
                <Slider
                  value={[assessmentData.enforcement]}
                  onValueChange={(v) => setAssessmentData({ ...assessmentData, enforcement: v[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-600">
                  Patrol frequency, violation responses, stakeholder compliance rates
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Community Participation</Label>
                  <span className="font-bold text-green-600">{assessmentData.community}%</span>
                </div>
                <Slider
                  value={[assessmentData.community]}
                  onValueChange={(v) => setAssessmentData({ ...assessmentData, community: v[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-600">
                  Local engagement, awareness levels, co-management activities, support
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Ecological Condition</Label>
                  <span className="font-bold text-orange-600">{assessmentData.ecological}%</span>
                </div>
                <Slider
                  value={[assessmentData.ecological]}
                  onValueChange={(v) => setAssessmentData({ ...assessmentData, ecological: v[0] })}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-600">
                  Habitat quality, species abundance, water quality, ecosystem health indicators
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assessment Notes</Label>
              <Textarea
                placeholder="Key observations, challenges, recommendations..."
                value={assessmentData.notes}
                onChange={(e) => setAssessmentData({ ...assessmentData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitAssessment} className="flex-1">
                Submit Assessment
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAssessmentForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardDescription>System Average</CardDescription>
            <CardTitle className="text-3xl">{avgEffectiveness.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge {...getScoreBadge(avgEffectiveness)}>
              {getScoreBadge(avgEffectiveness).label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-3">
            <CardDescription>Highest Performing</CardDescription>
            <CardTitle className="text-lg">{comparisonData[0].fullName.split(' ')[0]}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{comparisonData[0].score.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-600">
          <CardHeader className="pb-3">
            <CardDescription>MPAs Monitored</CardDescription>
            <CardTitle className="text-3xl">{mockEffectivenessData.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Q4 2025 Period</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardHeader className="pb-3">
            <CardDescription>Avg Improvement</CardDescription>
            <CardTitle className="text-3xl text-green-600">+2.5%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>vs Q3 2025</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="individual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individual">Individual MPA</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Individual MPA Analysis */}
        <TabsContent value="individual" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Select MPA for Detailed Analysis</CardTitle>
                  <CardDescription>View comprehensive effectiveness scores</CardDescription>
                </div>
                <Select value={selectedMpa} onValueChange={setSelectedMpa}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMPAs.map(mpa => (
                      <SelectItem key={mpa.id} value={mpa.id}>
                        {mpa.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle>{selectedMpaData?.name}</CardTitle>
                <CardDescription>Overall Management Effectiveness - Q4 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className={`text-6xl font-bold mb-4 ${getScoreColor(currentEffectiveness?.overall || 0)}`}>
                    {currentEffectiveness?.overall.toFixed(1)}%
                  </div>
                  <Badge {...getScoreBadge(currentEffectiveness?.overall || 0)} className="text-lg px-4 py-2">
                    {getScoreBadge(currentEffectiveness?.overall || 0).label}
                  </Badge>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Barangay</p>
                      <p className="font-semibold">{selectedMpaData?.barangay}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Area</p>
                      <p className="font-semibold">{selectedMpaData?.area} ha</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
                <CardDescription>Scores across evaluation criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid key="polar-grid" />
                    <PolarAngleAxis dataKey="category" key="polar-angle" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} key="polar-radius" />
                    <Radar name="Score" dataKey="score" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} key="radar-score" />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Score Breakdown</CardTitle>
              <CardDescription>Individual criteria performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Management Planning</span>
                    </div>
                    <span className={`font-bold ${getScoreColor(currentEffectiveness?.scores.management || 0)}`}>
                      {currentEffectiveness?.scores.management}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${currentEffectiveness?.scores.management}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-teal-600" />
                      <span className="font-medium">Law Enforcement</span>
                    </div>
                    <span className={`font-bold ${getScoreColor(currentEffectiveness?.scores.enforcement || 0)}`}>
                      {currentEffectiveness?.scores.enforcement}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-teal-600 h-3 rounded-full transition-all"
                      style={{ width: `${currentEffectiveness?.scores.enforcement}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Community Participation</span>
                    </div>
                    <span className={`font-bold ${getScoreColor(currentEffectiveness?.scores.community || 0)}`}>
                      {currentEffectiveness?.scores.community}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${currentEffectiveness?.scores.community}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">Ecological Condition</span>
                    </div>
                    <span className={`font-bold ${getScoreColor(currentEffectiveness?.scores.ecological || 0)}`}>
                      {currentEffectiveness?.scores.ecological}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-orange-600 h-3 rounded-full transition-all"
                      style={{ width: `${currentEffectiveness?.scores.ecological}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison View */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MPA Performance Comparison</CardTitle>
              <CardDescription>Ranking of all MPAs by overall effectiveness score</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" key="cart-grid" />
                  <XAxis type="number" domain={[0, 100]} key="x-axis" />
                  <YAxis dataKey="name" type="category" width={100} key="y-axis" />
                  <Tooltip key="tooltip" />
                  <Bar dataKey="score" fill="#0ea5e9" radius={[0, 8, 8, 0]} key="bar-score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4">Rank</th>
                      <th className="text-left py-3 px-4">MPA Name</th>
                      <th className="text-center py-3 px-4">Management</th>
                      <th className="text-center py-3 px-4">Enforcement</th>
                      <th className="text-center py-3 px-4">Community</th>
                      <th className="text-center py-3 px-4">Ecological</th>
                      <th className="text-center py-3 px-4">Overall</th>
                      <th className="text-center py-3 px-4">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockEffectivenessData
                      .sort((a, b) => b.overall - a.overall)
                      .map((item, index) => (
                        <tr key={item.mpaId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-bold">#{index + 1}</td>
                          <td className="py-3 px-4 font-medium">{item.mpaName}</td>
                          <td className="py-3 px-4 text-center">{item.scores.management}</td>
                          <td className="py-3 px-4 text-center">{item.scores.enforcement}</td>
                          <td className="py-3 px-4 text-center">{item.scores.community}</td>
                          <td className="py-3 px-4 text-center">{item.scores.ecological}</td>
                          <td className={`py-3 px-4 text-center font-bold ${getScoreColor(item.overall)}`}>
                            {item.overall.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge {...getScoreBadge(item.overall)}>
                              {getScoreBadge(item.overall).label}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends View */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Trend Analysis</CardTitle>
              <CardDescription>Historical effectiveness scores for {selectedMpaData?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mpaHistory}>
                  <CartesianGrid strokeDasharray="3 3" key="cart-grid" />
                  <XAxis dataKey="period" key="x-axis" />
                  <YAxis domain={[0, 100]} key="y-axis" />
                  <Tooltip key="tooltip" />
                  <Legend key="legend" />
                  <Line type="monotone" dataKey="overall" stroke="#0ea5e9" strokeWidth={3} name="Overall" key="line-overall" />
                  <Line type="monotone" dataKey="management" stroke="#3b82f6" strokeWidth={2} name="Management" key="line-management" />
                  <Line type="monotone" dataKey="enforcement" stroke="#14b8a6" strokeWidth={2} name="Enforcement" key="line-enforcement" />
                  <Line type="monotone" dataKey="community" stroke="#22c55e" strokeWidth={2} name="Community" key="line-community" />
                  <Line type="monotone" dataKey="ecological" stroke="#f97316" strokeWidth={2} name="Ecological" key="line-ecological" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}