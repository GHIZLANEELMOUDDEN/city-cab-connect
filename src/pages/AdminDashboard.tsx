import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Car,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Bell,
  Menu,
  ChevronLeft
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const stats = {
    totalDrivers: 1234,
    activeDrivers: 856,
    totalTrips: 52340,
    monthlyRevenue: "156,780 درهم",
    pendingApprovals: 23,
    openTickets: 8,
  };

  const recentDrivers = [
    { id: 1, name: "محمد أمين", city: "الدار البيضاء", status: "active", trips: 1520, rating: 4.9 },
    { id: 2, name: "كريم الحسني", city: "الرباط", status: "pending", trips: 0, rating: 0 },
    { id: 3, name: "عبد الله", city: "مراكش", status: "blocked", trips: 890, rating: 4.2 },
    { id: 4, name: "يوسف العلوي", city: "فاس", status: "active", trips: 2100, rating: 4.8 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">نشط</span>;
      case "pending":
        return <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">قيد المراجعة</span>;
      case "blocked":
        return <span className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-medium">محظور</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`bg-secondary text-secondary-foreground ${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 fixed h-full z-40`}>
        <div className="p-4 border-b border-secondary-foreground/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg">Taxicity Admin</span>}
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { id: "overview", icon: BarChart3, label: "نظرة عامة" },
            { id: "drivers", icon: Users, label: "السائقين" },
            { id: "trips", icon: MapPin, label: "الرحلات" },
            { id: "payments", icon: DollarSign, label: "المدفوعات" },
            { id: "support", icon: AlertCircle, label: "الدعم الفني" },
            { id: "settings", icon: Settings, label: "الإعدادات" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-secondary-foreground/10"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link 
            to="/"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-foreground/10 transition-colors text-secondary-foreground/70"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? "mr-64" : "mr-20"} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold">لوحة التحكم</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="بحث..." 
                  className="w-64 h-10 pr-10 pl-4 rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button className="relative p-2">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {stats.openTickets}
                </span>
              </button>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm text-accent flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +12%
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.totalDrivers}</div>
              <div className="text-sm text-muted-foreground">إجمالي السائقين</div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <span className="text-sm text-accent flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +8%
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.activeDrivers}</div>
              <div className="text-sm text-muted-foreground">سائقين نشطين</div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Car className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-sm text-accent flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +23%
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.totalTrips.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">إجمالي الرحلات</div>
            </div>

            <div className="bg-gradient-to-br from-primary to-taxi-yellow-dark text-primary-foreground rounded-2xl p-6 shadow-glow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-sm flex items-center gap-1 opacity-90">
                  <TrendingUp className="w-4 h-4" />
                  +18%
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.monthlyRevenue}</div>
              <div className="text-sm opacity-90">إيرادات الشهر</div>
            </div>
          </div>

          {/* Alerts */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{stats.pendingApprovals} طلب انضمام جديد</div>
                <div className="text-sm text-muted-foreground">بانتظار المراجعة والموافقة</div>
              </div>
              <Button variant="default" size="sm">مراجعة</Button>
            </div>

            <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{stats.openTickets} تذاكر دعم مفتوحة</div>
                <div className="text-sm text-muted-foreground">تحتاج للرد والمتابعة</div>
              </div>
              <Button variant="outline" size="sm" className="border-destructive text-destructive">عرض</Button>
            </div>
          </div>

          {/* Recent Drivers Table */}
          <div className="bg-card rounded-2xl shadow-soft border border-border/50">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">آخر السائقين</h2>
                <Button variant="ghost" size="sm">
                  عرض الكل
                  <ChevronLeft className="w-4 h-4 mr-1" />
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right p-4 font-medium text-muted-foreground">السائق</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">المدينة</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">الحالة</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">الرحلات</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">التقييم</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDrivers.map((driver) => (
                    <tr key={driver.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium">{driver.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{driver.city}</td>
                      <td className="p-4">{getStatusBadge(driver.status)}</td>
                      <td className="p-4">{driver.trips.toLocaleString()}</td>
                      <td className="p-4">
                        {driver.rating > 0 ? (
                          <span className="flex items-center gap-1">
                            <span className="text-primary">★</span>
                            {driver.rating}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">تفاصيل</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
