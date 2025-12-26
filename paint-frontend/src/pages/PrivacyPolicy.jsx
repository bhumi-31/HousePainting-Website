import Layout from "../components/layout/Layout";
import { Shield, Lock, Eye, UserCheck, Mail, FileText } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="bg-primary py-16">
                <div className="container-custom text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-black text-primary-foreground mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                        Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                    </p>
                    <p className="text-primary-foreground/60 text-sm mt-4">
                        Last updated: December 2025
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="section-padding bg-background">
                <div className="container-custom max-w-4xl">
                    <div className="prose prose-lg max-w-none">

                        {/* Introduction */}
                        <div className="bg-card rounded-xl p-8 border border-border mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Introduction</h2>
                                    <p className="text-muted-foreground">
                                        Chandan House Painting ("we," "our," or "us") is committed to protecting your privacy.
                                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                                        when you visit our website or use our services.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Information We Collect */}
                        <div className="bg-card rounded-xl p-8 border border-border mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Eye className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Information We Collect</h2>
                                    <div className="space-y-4 text-muted-foreground">
                                        <div>
                                            <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Name and contact information (email, phone number)</li>
                                                <li>Address and location details for service delivery</li>
                                                <li>Account credentials (for registered users)</li>
                                                <li>Payment information (processed securely through third-party providers)</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground mb-2">Automatically Collected Information</h3>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Browser type and version</li>
                                                <li>Device information</li>
                                                <li>IP address and location data</li>
                                                <li>Pages visited and time spent on our website</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* How We Use Your Information */}
                        <div className="bg-card rounded-xl p-8 border border-border mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <UserCheck className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">How We Use Your Information</h2>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>To provide and maintain our painting services</li>
                                        <li>To process your quote requests and bookings</li>
                                        <li>To communicate with you about your projects</li>
                                        <li>To send you promotional emails (with your consent)</li>
                                        <li>To improve our website and services</li>
                                        <li>To comply with legal obligations</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Data Security */}
                        <div className="bg-card rounded-xl p-8 border border-border mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Lock className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Data Security</h2>
                                    <p className="text-muted-foreground mb-4">
                                        We implement appropriate technical and organizational security measures to protect your
                                        personal information against unauthorized access, alteration, disclosure, or destruction.
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Encrypted data transmission (SSL/TLS)</li>
                                        <li>Secure password storage with hashing</li>
                                        <li>Regular security audits and updates</li>
                                        <li>Limited access to personal data by authorized personnel only</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Your Rights */}
                        <div className="bg-card rounded-xl p-8 border border-border mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Your Rights</h2>
                                    <p className="text-muted-foreground mb-4">You have the right to:</p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Access your personal data</li>
                                        <li>Correct inaccurate information</li>
                                        <li>Request deletion of your data</li>
                                        <li>Opt-out of marketing communications</li>
                                        <li>Withdraw consent at any time</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Contact Us */}
                        <div className="bg-accent/10 rounded-xl p-8 border border-accent/20">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Contact Us</h2>
                                    <p className="text-muted-foreground mb-4">
                                        If you have any questions about this Privacy Policy or our data practices, please contact us:
                                    </p>
                                    <div className="space-y-2 text-muted-foreground">
                                        <p><strong>Email:</strong> chandansingh3016@gmail.com</p>
                                        <p><strong>Phone:</strong> +1 (705) 951-0764</p>
                                        <p><strong>Address:</strong> 36 Harbourtown Crescent, Ontario, Canada</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </Layout>
    );
}
