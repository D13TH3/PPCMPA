import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import {
  Info,
  Download,
  FileText,
  Image,
  BookOpen,
  Shield,
  Waves,
  Leaf,
  Users,
  Target
} from 'lucide-react';

export default function InformationHub() {
  const downloadItems = [
    {
      title: 'MPA Zoning Map',
      description: 'Official marine protected area boundaries and zones',
      format: 'PDF',
      size: '2.4 MB',
      icon: Image,
      file: 'mpa-zoning-map.pdf'
    },
    {
      title: 'Environmental Guidelines',
      description: 'Conservation rules and best practices for visitors',
      format: 'PDF',
      size: '1.2 MB',
      icon: BookOpen,
      file: 'environmental-guidelines.pdf'
    },
    {
      title: 'Public Awareness Materials',
      description: 'Educational resources about marine conservation',
      format: 'PDF',
      size: '3.8 MB',
      icon: FileText,
      file: 'public-awareness.pdf'
    },
    {
      title: 'MPA Summary Report 2025',
      description: 'General summary of protected areas and conservation efforts',
      format: 'PDF',
      size: '5.1 MB',
      icon: FileText,
      file: 'summary-report-2025.pdf'
    }
  ];

  const handleDownload = (filename: string) => {
    // In production, this would download the actual file
    // For demo, we'll just show a message
    console.log(`Downloading ${filename}`);
    alert(`Download started: ${filename}\n\nNote: This is a demo. In production, the file would download automatically.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Information Hub</h2>
        <p className="mt-1 text-sm md:text-base text-gray-600">
          Learn about the MPA system and access public resources
        </p>
      </div>

      {/* About the MPA System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            About the MPA System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What is the MPA System?</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              The Puerto Princesa Marine Protected Area (MPA) Management System is a comprehensive
              platform designed to protect and preserve our coastal and marine ecosystems. This
              system enables local government units, environmental officers, and citizens to work
              together in monitoring, managing, and conserving our precious marine resources.
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">System Purpose</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Our mission is to ensure sustainable use of marine resources while protecting
              biodiversity hotspots including coral reefs, seagrass beds, and mangrove forests.
              The system provides tools for spatial mapping, community reporting, and data-driven
              decision making to support effective marine conservation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How to Use the Platform */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            How to Use This Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Waves className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">View Marine Protected Areas</h4>
                  <p className="text-sm text-blue-800">
                    Use the Map Viewer to explore protected zones, boundaries, and conservation areas
                    across Puerto Princesa's coastal waters.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">Report Environmental Issues</h4>
                  <p className="text-sm text-green-800">
                    Submit reports about illegal fishing, pollution, coral damage, or wildlife
                    disturbance. Your reports help protect our marine ecosystems.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">Track Your Reports</h4>
                  <p className="text-sm text-purple-800">
                    Monitor the status of your submissions from "Submitted" to "Under Review" to
                    final resolution. Stay informed about actions taken.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
              <div className="flex items-start gap-3">
                <Download className="h-6 w-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-teal-900 mb-1">Access Public Resources</h4>
                  <p className="text-sm text-teal-800">
                    Download maps, guidelines, and educational materials to learn more about
                    marine conservation and protected areas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Protection Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Environmental Protection Guidelines
          </CardTitle>
          <CardDescription>
            Best practices for visiting and protecting marine protected areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700 flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Respect No-Take Zones</h4>
                <p className="text-sm text-gray-600">
                  Core protection areas prohibit all fishing and extraction activities. These zones
                  are critical for species recovery and breeding.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700 flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Report Illegal Activities</h4>
                <p className="text-sm text-gray-600">
                  If you witness illegal fishing (dynamite, cyanide, trawling), poaching, or
                  pollution, report it immediately through this platform.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700 flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Minimize Environmental Impact</h4>
                <p className="text-sm text-gray-600">
                  Avoid touching coral reefs, dispose of waste properly, and use reef-safe sunscreen.
                  Practice sustainable tourism and responsible diving.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700 flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Follow Local Regulations</h4>
                <p className="text-sm text-gray-600">
                  Comply with all ordinances, permits, and entry requirements for protected areas.
                  Respect seasonal closures and capacity limits.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700 flex-shrink-0">
                5
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Educate and Advocate</h4>
                <p className="text-sm text-gray-600">
                  Share knowledge about marine conservation with your community. Support sustainable
                  fishing practices and eco-tourism initiatives.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LGU Purpose and Conservation Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            LGU Purpose & Conservation Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Local Government Unit's Mission</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              The Puerto Princesa City Local Government Unit (LGU), through its Environment and
              Natural Resources Office, is committed to protecting and rehabilitating marine ecosystems
              while ensuring sustainable livelihoods for coastal communities. Our approach balances
              conservation with socio-economic development.
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Key Conservation Goals</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  <strong>Biodiversity Protection:</strong> Preserve critical habitats for endangered
                  species including marine turtles, dugongs, and coral reef ecosystems.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  <strong>Sustainable Fisheries:</strong> Restore fish stocks through science-based
                  management, seasonal closures, and community-led enforcement.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  <strong>Climate Resilience:</strong> Enhance coastal protection through mangrove
                  restoration and coral reef rehabilitation to buffer against climate impacts.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  <strong>Community Engagement:</strong> Empower local fisherfolk, tourism operators,
                  and residents as stewards of marine resources through education and livelihood programs.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-600 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">
                  <strong>Data-Driven Management:</strong> Use technology and spatial information
                  systems to monitor effectiveness, adapt strategies, and ensure transparency.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Downloads Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-teal-600" />
            Public Resources & Downloads
          </CardTitle>
          <CardDescription>
            Access maps, guidelines, and educational materials (public-safe data only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {downloadItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-teal-300 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 flex-shrink-0">
                    <Icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span className="rounded bg-gray-100 px-2 py-0.5">{item.format}</span>
                      <span>{item.size}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(item.file)}
                    className="flex-shrink-0"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="flex items-start gap-2 text-sm text-yellow-900">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> These downloads contain general public information only.
                Internal operational data, confidential reports, and sensitive system information
                are not included in public resources.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
