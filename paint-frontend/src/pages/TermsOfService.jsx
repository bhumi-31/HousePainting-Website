import Layout from "../components/layout/Layout";
import { FileText, AlertCircle, CheckCircle, Ban, Scale, Mail } from "lucide-react";

export default function TermsOfService() {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="bg-primary py-16">
                <div className="container-custom text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Scale className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-black text-primary-foreground mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                        Please read these terms carefully before using our services.
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

                        {/* Acceptance of Terms */}
                        <div className="bg-card rounded-xl p-8 border border-border mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                                    <p className="text-muted-foreground">
                                        By accessing or using Chandan House Painting's website and services, you agree to be bound
                                        by these Terms of Service. If you do not agree to these terms, please do not use our services.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Services */}
                        <div className="bg-card rounded-xl p-8 border border-border mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">2. Our Services</h2>
                                    <div className="space-y-4 text-muted-foreground">
                                        <p>Chandan House Painting provides professional painting services including:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Interior and exterior residential painting</li>
                                            <li>Commercial painting services</li>
                                            <li>Deck and fence staining</li>
                                            <li>Wall preparation and repair</li>
                                            <li>Color consultation</li>
                                        </ul>
                                        <p>
                                            All services are subject to availability and geographic service area limitations.
                                            We reserve the right to refuse service at our discretion.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quotes and Pricing */}
                        <div className="bg-card rounded-xl p-8 border border-border mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">3. Quotes and Pricing</h2>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Online quotes are estimates and may change after on-site assessment</li>
                                        <li>Final pricing will be confirmed before work begins</li>
                                        <li>Quotes are valid for 30 days unless otherwise specified</li>
                                        <li>Additional work discovered during the project may incur extra charges</li>
                                        <li>Payment terms will be agreed upon before project commencement</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* User Responsibilities */}
                        <div className="bg-card rounded-xl p-8 border border-border mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">4. Customer Responsibilities</h2>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Provide accurate information when requesting quotes</li>
                                        <li>Ensure access to the work area on scheduled dates</li>
                                        <li>Remove or protect valuable items from the work area</li>
                                        <li>Inform us of any known hazards or special conditions</li>
                                        <li>Make timely payments as agreed</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Prohibited Uses */}
                        <div className="bg-card rounded-xl p-8 border border-border mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Ban className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">5. Prohibited Uses</h2>
                                    <p className="text-muted-foreground mb-4">You agree not to:</p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Use our website for any unlawful purpose</li>
                                        <li>Attempt to gain unauthorized access to our systems</li>
                                        <li>Submit false or misleading information</li>
                                        <li>Interfere with the proper functioning of the website</li>
                                        <li>Copy or reproduce our content without permission</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Limitation of Liability */}
                        <div className="bg-card rounded-xl p-8 border border-border mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Scale className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">6. Limitation of Liability</h2>
                                    <p className="text-muted-foreground">
                                        Chandan House Painting shall not be liable for any indirect, incidental, special,
                                        consequential, or punitive damages arising from your use of our services or website.
                                        Our liability is limited to the amount paid for the specific service in question.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Changes to Terms */}
                        <div className="bg-card rounded-xl p-8 border border-border mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-heading font-bold text-foreground mb-4">7. Changes to Terms</h2>
                                    <p className="text-muted-foreground">
                                        We reserve the right to modify these Terms of Service at any time. Changes will be
                                        effective immediately upon posting to this page. Your continued use of our services
                                        after changes constitutes acceptance of the modified terms.
                                    </p>
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
                                        If you have any questions about these Terms of Service, please contact us:
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
