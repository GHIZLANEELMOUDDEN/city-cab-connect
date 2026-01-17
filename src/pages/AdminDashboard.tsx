import { useState, useEffect } from "react";
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
  ChevronLeft,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Shield,
  Crown,
  Star,
  Calendar
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { hasAdminAccess, isAdmin, loading: roleLoading } = useAdminRole();
  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useAdminStats();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();

  useEffect(() => {
    if (!roleLoading && !hasAdminAccess) {
      toast.error("ليس لديك صلاحية الوصول لهذه الصفحة");
      navigate("/");
    }
  }, [hasAdminAccess, roleLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAdminAccess) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-accent/20 text-accent border-accent/30">نشط</Badge>;
      case "pending":
        return <Badge className="bg-primary/20 text-primary border-primary/30">قيد المراجعة</Badge>;
      case "blocked":
        return <Badge variant="destructive">محظور</Badge>;
      default:
        return null;
    }
  };

  const getPlanBadge = (planType: string | null) => {
    if (!planType) return <Badge variant="outline">غير مشترك</Badge>;
    
    switch (planType) {
      case "basic":
        return <Badge className="bg-slate-500/20 text-slate-600 border-slate-500/30">أساسية</Badge>;
      case "premium":
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">مميزة</Badge>;
      case "professional":
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">احترافية</Badge>;
      default:
        return null;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`bg-secondary text-secondary-foreground ${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 fixed h-full z-40`}>
        <div className="p-4 border-b border-secondary-foreground/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg">لوحة الإدارة</span>}
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { id: "overview", icon: BarChart3, label: "نظرة عامة" },
            { id: "subscriptions", icon: CreditCard, label: "الاشتراكات" },
            { id: "drivers", icon: Users, label: "السائقين" },
            { id: "trips", icon: MapPin, label: "الرحلات" },
            { id: "notifications", icon: Bell, label: "التنبيهات" },
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
              {sidebarOpen && (
                <span className="flex-1 text-right">{item.label}</span>
              )}
              {item.id === "notifications" && unreadCount > 0 && sidebarOpen && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary-foreground/10 transition-colors text-secondary-foreground/70"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </button>
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
              {isAdmin && (
                <Badge className="bg-amber-500/20 text-amber-600">
                  <Crown className="w-3 h-3 ml-1" />
                  مدير
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStats}
                disabled={statsLoading}
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${statsLoading ? "animate-spin" : ""}`} />
                تحديث
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2">
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between p-2 border-b">
                    <span className="font-semibold">التنبيهات</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                        قراءة الكل
                      </Button>
                    )}
                  </div>
                  {notifications.slice(0, 5).map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      className={`flex items-start gap-2 p-3 ${!notif.is_read ? "bg-muted/50" : ""}`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      {getNotificationIcon(notif.type)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{notif.title}</div>
                        <div className="text-xs text-muted-foreground">{notif.message}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                      لا توجد تنبيهات
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {statsError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-destructive">{statsError}</span>
            </div>
          )}

          {activeTab === "overview" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-sm text-accent flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +12%
                      </span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.totalDrivers || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">إجمالي السائقين</div>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-accent" />
                      </div>
                      <span className="text-sm text-accent flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +8%
                      </span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.activeDrivers || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">سائقين مشتركين</div>
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                        <Car className="w-6 h-6 text-secondary" />
                      </div>
                      <span className="text-sm text-accent flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +23%
                      </span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats?.totalTrips || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">إجمالي الرحلات</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-glow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <span className="text-sm flex items-center gap-1 opacity-90">
                        <TrendingUp className="w-4 h-4" />
                        +18%
                      </span>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `${(stats?.monthlyRevenue || 0).toLocaleString()} درهم`}
                    </div>
                    <div className="text-sm opacity-90">إيرادات الشهر</div>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription Breakdown */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
                        <Star className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-semibold">الباقة الأساسية</div>
                        <div className="text-sm text-muted-foreground">100 درهم/شهر</div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-600">
                      {stats?.planCounts?.basic || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-soft border-amber-200/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Crown className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-semibold">الباقة المميزة</div>
                        <div className="text-sm text-muted-foreground">150 درهم/شهر</div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-amber-600">
                      {stats?.planCounts?.premium || 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-soft border-purple-200/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold">الباقة الاحترافية</div>
                        <div className="text-sm text-muted-foreground">200 درهم/شهر</div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-purple-600">
                      {stats?.planCounts?.professional || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts */}
              {stats?.expiringSubscriptions && stats.expiringSubscriptions.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{stats.expiringSubscriptions.length} اشتراكات تنتهي قريباً</div>
                    <div className="text-sm text-muted-foreground">
                      هناك اشتراكات ستنتهي خلال 7 أيام
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-amber-500 text-amber-600">
                    عرض التفاصيل
                  </Button>
                </div>
              )}

              {stats?.pendingDrivers && stats.pendingDrivers > 0 && (
                <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{stats.pendingDrivers} سائقين بدون اشتراك</div>
                    <div className="text-sm text-muted-foreground">سائقين مسجلين ولكن لم يشتركوا بعد</div>
                  </div>
                  <Button variant="default" size="sm">مراسلتهم</Button>
                </div>
              )}

              {/* Recent Drivers Table */}
              <Card className="shadow-soft">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>آخر السائقين المسجلين</CardTitle>
                    <Button variant="ghost" size="sm">
                      عرض الكل
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-right p-4 font-medium text-muted-foreground">السائق</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">المدينة</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">الاشتراك</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">الرحلات</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">التقييم</th>
                          <th className="text-right p-4 font-medium text-muted-foreground">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statsLoading ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            </td>
                          </tr>
                        ) : stats?.recentDrivers?.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                              لا يوجد سائقين مسجلين
                            </td>
                          </tr>
                        ) : (
                          stats?.recentDrivers?.map((driver) => (
                            <tr key={driver.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <span className="font-medium">{driver.full_name || "بدون اسم"}</span>
                                    {driver.is_verified && (
                                      <CheckCircle className="w-4 h-4 text-accent inline-block mr-1" />
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground">{driver.city || "-"}</td>
                              <td className="p-4">
                                {getPlanBadge(driver.driver_subscriptions?.[0]?.plan_type || null)}
                              </td>
                              <td className="p-4">{(driver.total_trips || 0).toLocaleString()}</td>
                              <td className="p-4">
                                {driver.rating && driver.rating > 0 ? (
                                  <span className="flex items-center gap-1">
                                    <span className="text-primary">★</span>
                                    {Number(driver.rating).toFixed(1)}
                                  </span>
                                ) : "-"}
                              </td>
                              <td className="p-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => navigate(`/admin/driver/${driver.user_id}`)}
                                >
                                  تفاصيل
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "subscriptions" && (
            <div className="space-y-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>إدارة الاشتراكات</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="active">
                    <TabsList className="mb-4">
                      <TabsTrigger value="active">النشطة</TabsTrigger>
                      <TabsTrigger value="expiring">تنتهي قريباً</TabsTrigger>
                      <TabsTrigger value="expired">منتهية</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active">
                      <div className="text-center py-8 text-muted-foreground">
                        {stats?.activeDrivers || 0} اشتراك نشط
                      </div>
                    </TabsContent>
                    <TabsContent value="expiring">
                      {stats?.expiringSubscriptions?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          لا توجد اشتراكات تنتهي قريباً
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {stats?.expiringSubscriptions?.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{sub.profiles?.full_name || "سائق"}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ينتهي: {new Date(sub.current_period_end).toLocaleDateString("ar-MA")}
                                  </div>
                                </div>
                              </div>
                              {getPlanBadge(sub.plan_type)}
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="expired">
                      <div className="text-center py-8 text-muted-foreground">
                        قريباً - إدارة الاشتراكات المنتهية
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "drivers" && (
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>جميع السائقين</CardTitle>
                  <div className="relative">
                    <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="بحث عن سائق..." 
                      className="w-64 h-10 pr-10 pl-4 rounded-xl bg-muted border-0 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  {stats?.totalDrivers || 0} سائق مسجل
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "trips" && (
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stats?.todayTrips || 0}
                  </div>
                  <div className="text-muted-foreground">رحلات اليوم</div>
                </CardContent>
              </Card>
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-accent mb-2">
                    {stats?.monthlyTrips || 0}
                  </div>
                  <div className="text-muted-foreground">رحلات الشهر</div>
                </CardContent>
              </Card>
              <Card className="shadow-soft">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-secondary mb-2">
                    {(stats?.totalTrips || 0).toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">إجمالي الرحلات</div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>جميع التنبيهات</CardTitle>
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                      تعليم الكل كمقروء
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد تنبيهات
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                          notif.is_read ? "bg-background" : "bg-muted/50 border-primary/30"
                        }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        {getNotificationIcon(notif.type)}
                        <div className="flex-1">
                          <div className="font-medium">{notif.title}</div>
                          <div className="text-sm text-muted-foreground">{notif.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.created_at).toLocaleString("ar-MA")}
                          </div>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "settings" && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>الإعدادات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  قريباً - إعدادات النظام
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
