import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ArrowRight,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  DollarSign,
  Calendar,
  Download,
  Loader2,
  PieChart,
  Activity
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";

interface DailyStats {
  date: string;
  trips: number;
  revenue: number;
  newDrivers: number;
}

interface PlanDistribution {
  name: string;
  value: number;
  color: string;
}

interface CityStats {
  city: string;
  drivers: number;
  trips: number;
}

const AdminReports = () => {
  const { user } = useAuth();
  const { hasAdminAccess, loading: roleLoading } = useAdminRole();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution[]>([]);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [totals, setTotals] = useState({
    totalTrips: 0,
    totalRevenue: 0,
    totalDrivers: 0,
    avgTripsPerDay: 0,
    growthRate: 0,
  });

  useEffect(() => {
    if (!roleLoading && !hasAdminAccess) {
      toast.error("ليس لديك صلاحية الوصول");
      navigate("/");
    }
  }, [hasAdminAccess, roleLoading, navigate]);

  useEffect(() => {
    if (hasAdminAccess) {
      fetchReportData();
    }
  }, [hasAdminAccess, period]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      if (period === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === "month") {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === "year") {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      // Fetch trips data
      const { data: trips, error: tripsError } = await supabase
        .from("trips")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (tripsError) throw tripsError;

      // Fetch subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from("driver_subscriptions")
        .select("*")
        .eq("status", "active");

      if (subsError) throw subsError;

      // Fetch drivers
      const { data: drivers, error: driversError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_type", "driver");

      if (driversError) throw driversError;

      // Process daily stats
      const dailyMap = new Map<string, DailyStats>();
      
      trips?.forEach((trip) => {
        const date = new Date(trip.created_at).toLocaleDateString("ar-MA");
        const existing = dailyMap.get(date) || { date, trips: 0, revenue: 0, newDrivers: 0 };
        existing.trips += 1;
        existing.revenue += Number(trip.final_price || trip.estimated_price || 0);
        dailyMap.set(date, existing);
      });

      setDailyStats(Array.from(dailyMap.values()).slice(-7));

      // Process plan distribution
      const planCounts = { basic: 0, premium: 0, professional: 0 };
      subscriptions?.forEach((sub) => {
        if (sub.plan_type in planCounts) {
          planCounts[sub.plan_type as keyof typeof planCounts]++;
        }
      });

      setPlanDistribution([
        { name: "أساسية", value: planCounts.basic, color: "#64748b" },
        { name: "مميزة", value: planCounts.premium, color: "#f59e0b" },
        { name: "احترافية", value: planCounts.professional, color: "#8b5cf6" },
      ]);

      // Process city stats
      const cityMap = new Map<string, CityStats>();
      drivers?.forEach((driver) => {
        const city = driver.city || "غير محدد";
        const existing = cityMap.get(city) || { city, drivers: 0, trips: 0 };
        existing.drivers += 1;
        cityMap.set(city, existing);
      });

      setCityStats(Array.from(cityMap.values()).slice(0, 6));

      // Calculate totals
      const totalTrips = trips?.length || 0;
      const totalRevenue = trips?.reduce((sum, t) => sum + Number(t.final_price || t.estimated_price || 0), 0) || 0;
      const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      setTotals({
        totalTrips,
        totalRevenue,
        totalDrivers: drivers?.length || 0,
        avgTripsPerDay: Math.round(totalTrips / daysInPeriod),
        growthRate: 12.5, // Mock growth rate
      });

    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("حدث خطأ في تحميل التقارير");
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAdminAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <ArrowRight className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">التقارير والإحصائيات</h1>
          <Button variant="outline" size="sm" className="text-secondary-foreground border-secondary-foreground/30">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Period Selector */}
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
              <SelectItem value="year">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Car className="w-8 h-8 text-primary/20" />
                <div className="flex items-center gap-1 text-sm text-accent">
                  <TrendingUp className="w-4 h-4" />
                  +{totals.growthRate}%
                </div>
              </div>
              <div className="text-2xl font-bold">{totals.totalTrips}</div>
              <div className="text-sm text-muted-foreground">إجمالي الرحلات</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-accent/20" />
                <div className="flex items-center gap-1 text-sm text-accent">
                  <TrendingUp className="w-4 h-4" />
                  +18%
                </div>
              </div>
              <div className="text-2xl font-bold">{totals.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">الإيرادات (درهم)</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-secondary/20" />
              </div>
              <div className="text-2xl font-bold">{totals.totalDrivers}</div>
              <div className="text-sm text-muted-foreground">السائقين</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-primary/20" />
              </div>
              <div className="text-2xl font-bold">{totals.avgTripsPerDay}</div>
              <div className="text-sm text-muted-foreground">متوسط الرحلات/يوم</div>
            </CardContent>
          </Card>
        </div>

        {/* Trips Chart */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              الرحلات اليومية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="trips" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              الإيرادات اليومية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} درهم`, "الإيرادات"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--accent))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Plan Distribution */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                توزيع الاشتراكات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* City Distribution */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                السائقين حسب المدينة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis type="category" dataKey="city" stroke="#64748b" fontSize={12} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="drivers" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;
