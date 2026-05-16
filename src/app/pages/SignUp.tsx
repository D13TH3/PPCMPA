import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Map, ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // In production, this would create a new user account
      // For demo, we'll show success and redirect to login
      toast.success('Account created successfully!', {
        description: 'Please log in with your credentials',
      });
      setIsLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-md">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="space-y-1">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600">
                <Map className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Create Account</CardTitle>
            <CardDescription className="text-center">
              Sign up for public user access to the MPA Monitoring System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Dela Cruz"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                <p className="font-medium">Public User Access Includes:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• View interactive MPA maps</li>
                  <li>• Submit environmental issue reports</li>
                  <li>• Track your report status</li>
                </ul>
              </div>

              {/* Privacy Policy & Terms Consent */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  id="terms-signup"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
                <label htmlFor="terms-signup" className="text-sm text-gray-700 leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacy(true)}
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                    disabled={isLoading}
                  >
                    Privacy Policy
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                    disabled={isLoading}
                  >
                    Terms & Conditions
                  </button>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isLoading || !agreedToTerms}
              >
                <UserPlus className="h-4 w-4" />
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Log in
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-center text-sm text-gray-600">
            <strong>Demo Note:</strong> For staff, admin, or system admin access,{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-blue-600 hover:underline"
            >
              use demo login credentials
            </button>
          </p>
        </div>

        {/* Privacy Policy Dialog */}
        <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-blue-700">Privacy Policy</DialogTitle>
              <DialogDescription>
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm text-gray-700">
                <section>
                  <h3 className="font-semibold text-base mb-2">1. Introduction</h3>
                  <p>Puerto Princesa City Government ("we," "our," or "us") is committed to protecting the privacy and security of users of the Marine Protected Area (MPA) Dynamic Management and Spatial Information System. This Privacy Policy describes how we collect, use, store, and protect your personal information.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">2. Information We Collect</h3>
                  <p>We collect the following types of information:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li><strong>Account Information:</strong> Name, email address, and password</li>
                    <li><strong>Reports and Submissions:</strong> Environmental issue reports, photos, location data, and descriptions</li>
                    <li><strong>Usage Data:</strong> System access logs, feature usage patterns, and timestamps</li>
                    <li><strong>Location Data:</strong> Geographic coordinates when submitting reports or using map features</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">3. How We Use Your Information</h3>
                  <p>We use collected information for the following purposes:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Providing access to the MPA monitoring and reporting system</li>
                    <li>Processing and reviewing environmental issue reports</li>
                    <li>Managing user accounts and authentication</li>
                    <li>Improving marine conservation efforts and decision-making</li>
                    <li>Generating reports and analytics for environmental management</li>
                    <li>Ensuring system security and preventing unauthorized access</li>
                    <li>Complying with legal and regulatory requirements</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">4. Role-Based Access Control</h3>
                  <p>The system implements role-based permissions:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li><strong>Public Users:</strong> Can view maps, submit reports, and track report status</li>
                    <li><strong>Staff:</strong> Can verify public reports and log field incidents</li>
                    <li><strong>Admin:</strong> Can approve reports, manage MPA data, and generate analytics</li>
                    <li><strong>System Admin:</strong> Can manage users and system settings</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">5. Data Sharing and Disclosure</h3>
                  <p>We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>With authorized Puerto Princesa City Government personnel for official purposes</li>
                    <li>With relevant government agencies as required by law or regulation</li>
                    <li>In response to valid legal requests or court orders</li>
                    <li>To protect the rights, property, or safety of Puerto Princesa City Government or others</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">6. Data Security</h3>
                  <p>We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. Security measures include:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Encrypted data transmission (HTTPS/SSL)</li>
                    <li>Secure password storage with encryption</li>
                    <li>Role-based access control</li>
                    <li>Regular security audits and updates</li>
                    <li>Access logging and monitoring</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">7. User Responsibilities</h3>
                  <p>As a user, you are responsible for:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>Ensuring the accuracy of information you submit</li>
                    <li>Using the system only for legitimate environmental reporting purposes</li>
                    <li>Not submitting false, misleading, or malicious reports</li>
                    <li>Respecting the privacy of others when submitting location data or photos</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">8. Data Retention</h3>
                  <p>We retain your information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Environmental reports and MPA data may be retained indefinitely for historical and governance purposes.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">9. User Rights</h3>
                  <p>As a user of the System, you have the right to:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Access your personal information stored in the System</li>
                    <li>Request correction of inaccurate personal data</li>
                    <li>Request deletion of your account (subject to legal retention requirements)</li>
                    <li>Receive information about how your data is being used</li>
                  </ul>
                  <p className="mt-2">To exercise these rights, please contact the system administrator at privacy@puertoprincesampa.gov</p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">10. Changes to This Privacy Policy</h3>
                  <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify users of significant changes through the System or via email.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">11. Contact Information</h3>
                  <p>For questions or concerns about this Privacy Policy, please contact:</p>
                  <p className="mt-2">
                    Data Protection Officer<br />
                    Puerto Princesa City Government<br />
                    Marine Protected Area Management Office<br />
                    Email: privacy@puertoprincesampa.gov<br />
                    Last Updated: May 1, 2026
                  </p>
                </section>

                <section className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-base mb-2">12. Consent</h3>
                  <p>By creating an account and using the Puerto Princesa MPA Management System, you consent to the collection, use, and processing of your information as described in this Privacy Policy.</p>
                </section>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Terms and Conditions Dialog */}
        <Dialog open={showTerms} onOpenChange={setShowTerms}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-blue-700">Terms and Conditions</DialogTitle>
              <DialogDescription>
                Please read these terms and conditions carefully before creating your account.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm text-gray-700">
                <section>
                  <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
                  <p>By creating an account and using the Puerto Princesa Marine Protected Area (MPA) Management System ("the System"), you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to these terms, please do not use the System.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">2. Purpose and Scope</h3>
                  <p>This System is designed to enable public participation in marine conservation through:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Viewing interactive maps of marine protected areas</li>
                    <li>Submitting environmental issue reports</li>
                    <li>Tracking the status of submitted reports</li>
                    <li>Accessing public information about MPA conservation efforts</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">3. User Account Responsibilities</h3>
                  <p>As a public user, you agree to:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Provide accurate and truthful information when creating your account</li>
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Use the System only for legitimate environmental reporting purposes</li>
                    <li>Not submit false, misleading, or malicious reports</li>
                    <li>Not attempt to gain unauthorized access to any part of the System</li>
                    <li>Report any security vulnerabilities or system errors immediately</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">4. Environmental Issue Reporting</h3>
                  <p>When submitting environmental reports, you agree to:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Provide accurate and factual information to the best of your knowledge</li>
                    <li>Include relevant details such as location, date, and description of the issue</li>
                    <li>Respect the privacy of others when including photos or location data</li>
                    <li>Understand that submitted reports will be reviewed by government staff and administrators</li>
                    <li>Not use the reporting system for spam, harassment, or non-environmental purposes</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">5. Report Review Process</h3>
                  <p>You understand that:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Reports will be reviewed and verified by authorized staff members</li>
                    <li>Verified reports may be forwarded to administrators for final approval</li>
                    <li>The government reserves the right to reject or flag reports deemed inaccurate or inappropriate</li>
                    <li>Response times may vary depending on report complexity and urgency</li>
                    <li>You can track the status of your reports through the "My Reports" section</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">6. Data Accuracy and Liability</h3>
                  <p>While every effort is made to ensure the accuracy of data within the System, Puerto Princesa City Government does not warrant the completeness, accuracy, or reliability of any information. The government is not liable for any decisions made based on information provided through the System.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">7. Intellectual Property</h3>
                  <p>All content, data, maps, and materials within the System are the property of Puerto Princesa City Government unless otherwise noted. Unauthorized reproduction, distribution, or commercial use of System content is prohibited.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">8. System Availability</h3>
                  <p>While we strive to maintain continuous availability, the System may be temporarily unavailable due to maintenance, updates, or unforeseen technical issues. Puerto Princesa City Government is not liable for any disruptions to service.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">9. Prohibited Activities</h3>
                  <p>Users must not:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Attempt to compromise the security or integrity of the System</li>
                    <li>Interfere with other users' access to the System</li>
                    <li>Use the System to transmit malicious code or harmful content</li>
                    <li>Extract data for unauthorized purposes</li>
                    <li>Misrepresent your identity or affiliation</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">10. Account Termination</h3>
                  <p>Your access to the System may be terminated immediately, without notice, for violation of these terms or for any other reason deemed necessary by Puerto Princesa City Government. Upon termination, your right to use the System will immediately cease.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">11. Modifications to Terms</h3>
                  <p>Puerto Princesa City Government reserves the right to modify these terms at any time. Users will be notified of significant changes, and continued use of the System constitutes acceptance of the modified terms.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">12. Governing Law</h3>
                  <p>These terms and conditions are governed by the laws of the Philippines and the ordinances of Puerto Princesa City. Any disputes arising from the use of this System shall be subject to the jurisdiction of Philippine courts.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-base mb-2">13. Contact Information</h3>
                  <p>For questions regarding these terms or the System, please contact:</p>
                  <p className="mt-2">
                    Puerto Princesa City Government<br />
                    Marine Protected Area Management Office<br />
                    Email: mpa@puertoprincesampa.gov<br />
                    Last Updated: May 1, 2026
                  </p>
                </section>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
