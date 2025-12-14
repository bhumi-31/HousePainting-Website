import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FolderOpen, 
  FileText, 
  Star, 
  Paintbrush, 
  TrendingUp, 
  Eye,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  BarChart3
} from "lucide-react";
import { portfolioApi, quotesApi, reviewsApi, servicesApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: { total: 0, featured: 0, views: 0 },
    quotes: { total: 0, pending: 0, reviewing: 0, quoted: 0, accepted: 0, rejected: 0, conversionRate: "0%" },
    reviews: { total: 0, averageRating: 0 },
    services: { total: 0, active: 0 },
  });
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [projectStats, quoteStats, reviewStats, servicesData, quotesData] = await Promise.all([
        portfolioApi.getStats().catch(() => ({ stats: {} })),
        quotesApi.getStats().catch(() => ({ stats: {} })),
        reviewsApi.getStats().catch(() => ({ stats: {} })),
        servicesApi.getAll().catch(() => ({ services: [] })),
        quotesApi.getAll({ limit: 5 }).catch(() => ({ quotes: [] })),
      ]);

      const services = servicesData.services || [];
      const activeServices = services.filter(s => s.isActive !== false);

      setStats({
        projects: {
          total: projectStats.stats?.totalProjects || 0,
          featured: projectStats.stats?.featuredCount || 0,
          views: projectStats.stats?.totalViews || 0,
        },
        quotes: {
          total: quoteStats.stats?.totalQuotes || 0,
          pending: quoteStats.stats?.statusBreakdown?.pending || 0,
          reviewing: quoteStats.stats?.statusBreakdown?.reviewing || 0,
          quoted: quoteStats.stats?.statusBreakdown?.quoted || 0,
          accepted: quoteStats.stats?.statusBreakdown?.accepted || 0,
          rejected: quoteStats.stats?.statusBreakdown?.rejected || 0,
          conversionRate: quoteStats.stats?.conversionRate || "0%",
        },
        reviews: {
          total: reviewStats.stats?.totalReviews || 0,
          averageRating: parseFloat(reviewStats.stats?.averageRating) || 0,
        },
        services: {
          total: services.length,
          active: activeServices.length,
        },
      });

      setRecentQuotes(quotesData.quotes?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Projects",
      value: stats.projects.total,
      icon: FolderOpen,
      color: "from-blue-500 to-blue-600",
      sub: `${stats.projects.featured} featured`,
      link: "/admin/projects",
    },
    {
      title: "Quote Requests",
      value: stats.quotes.total,
      icon: FileText,
      color: "from-amber-500 to-orange-500",
      sub: `${stats.quotes.pending} pending`,
      link: "/admin/quotes",
    },
    {
      title: "Customer Reviews",
      value: stats.reviews.total,
      icon: Star,
      color: "from-yellow-400 to-yellow-500",
      sub: `${stats.reviews.averageRating.toFixed(1)} avg rating`,
      link: "/admin/reviews",
    },
    {
      title: "Active Services",
      value: stats.services.active,
      icon: Paintbrush,
      color: "from-emerald-500 to-green-500",
      sub: `${stats.services.total} total`,
      link: "/admin/services",
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      reviewing: "bg-blue-100 text-blue-700 border-blue-200",
      quoted: "bg-purple-100 text-purple-700 border-purple-200",
      accepted: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      reviewing: Eye,
      quoted: DollarSign,
      accepted: CheckCircle,
      rejected: XCircle,
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="w-3 h-3" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 md:p-8 text-primary-foreground">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
            </h1>
            <p className="text-primary-foreground/80">
              Here's what's happening with your painting business today.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin/quotes"
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              View Quotes
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="group bg-card rounded-xl p-6 border border-border hover:shadow-lg hover:border-accent/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-heading font-bold text-foreground mt-2">
                  {stat.value}
                </p>
                {stat.sub && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    {stat.sub}
                  </p>
                )}
              </div>
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
              <span className="text-muted-foreground">View details</span>
              <ArrowUpRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Status Overview */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-heading font-bold text-foreground">Quote Status Overview</h3>
              <p className="text-sm text-muted-foreground">Track your quote pipeline</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Conversion:</span>
              <span className="font-bold text-accent">{stats.quotes.conversionRate}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Pending", value: stats.quotes.pending, color: "bg-yellow-500" },
              { label: "Reviewing", value: stats.quotes.reviewing, color: "bg-blue-500" },
              { label: "Quoted", value: stats.quotes.quoted, color: "bg-purple-500" },
              { label: "Accepted", value: stats.quotes.accepted, color: "bg-green-500" },
              { label: "Rejected", value: stats.quotes.rejected, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label} className="bg-secondary rounded-lg p-4 text-center">
                <div className={`w-3 h-3 ${item.color} rounded-full mx-auto mb-2`} />
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-heading font-bold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/admin/projects"
              className="flex items-center gap-3 p-3 bg-secondary rounded-lg hover:bg-accent/20 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Add New Project</p>
                <p className="text-xs text-muted-foreground">Showcase your work</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            
            <Link
              to="/admin/services"
              className="flex items-center gap-3 p-3 bg-secondary rounded-lg hover:bg-accent/20 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Paintbrush className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Manage Services</p>
                <p className="text-xs text-muted-foreground">Update offerings</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            
            <Link
              to="/admin/reviews"
              className="flex items-center gap-3 p-3 bg-secondary rounded-lg hover:bg-accent/20 transition-colors group"
            >
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Review Feedback</p>
                <p className="text-xs text-muted-foreground">Approve reviews</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Quotes */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-bold text-foreground">Recent Quote Requests</h3>
            <p className="text-sm text-muted-foreground">Latest customer inquiries</p>
          </div>
          <Link
            to="/admin/quotes"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        
        {recentQuotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Service</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Room</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Est. Price</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotes.map((quote) => (
                  <tr key={quote._id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{quote.customerName}</p>
                          <p className="text-xs text-muted-foreground">{quote.customerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-foreground">{quote.service?.name || "General"}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell capitalize text-muted-foreground">
                      {quote.roomType?.replace("_", " ")}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-foreground">
                        ${quote.estimatedPrice?.total?.toLocaleString() || "TBD"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(quote.status)}`}>
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No quote requests yet</p>
            <p className="text-sm text-muted-foreground/70">When customers request quotes, they'll appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
