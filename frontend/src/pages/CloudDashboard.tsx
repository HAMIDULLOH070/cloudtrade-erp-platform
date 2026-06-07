import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Server,
  Zap,
  Activity,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Cpu,
  Clock,
  Wifi
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const CloudDashboard: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [scalingLogs, setScalingLogs] = useState<any[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statusRes, metricsRes, resRes, scaleRes, secRes] = await Promise.all([
        api.get('/cloud/status'),
        api.get('/cloud/metrics'),
        api.get('/cloud/resources'),
        api.get('/cloud/logs/scaling'),
        api.get('/cloud/logs/security')
      ]);
      setStatus(statusRes.data);
      setMetrics(metricsRes.data);
      setResources(resRes.data);
      setScalingLogs(scaleRes.data);
      setSecurityLogs(secRes.data);
    } catch (err) {
      console.error('Failed to load cloud metrics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll metrics every 8 seconds for semi-live updates
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSimulation = async () => {
    if (!status) return;
    setRefreshing(true);
    try {
      await api.post('/cloud/simulation', { highLoad: !status.simulateHighLoad });
      fetchData();
    } catch (err) {
      console.error('Failed to toggle simulation', err);
      setRefreshing(false);
    }
  };

  if (loading || !status) {
    return <div className="h-96 bg-white rounded-lg border border-slate-200 animate-pulse p-6" />;
  }

  // Format timestamp for x axis
  const chartData = metrics.map(m => ({
    ...m,
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }));

  return (
    <div className="space-y-6 font-sans">
      {/* Cloud Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between text-white space-y-4 md:space-y-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="flex items-center space-x-4 z-10">
          <div className={`p-3.5 rounded-full ${
            status.status === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
          }`}>
            <Server className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold flex items-center">
              Bulutli infratuzilma holati: 
              <span className={`ml-2 px-2.5 py-0.5 rounded text-xs font-bold ${
                status.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {status.status === 'HEALTHY' ? 'SOG\'LOM' : 'OGOHLANTIRISH'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              AWS Virtual Private Cloud (VPC) | Region: <span className="text-slate-350">us-east-1 (N. Virginia)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3.5 z-10">
          <button
            onClick={handleToggleSimulation}
            disabled={refreshing}
            className={`px-4 py-2 rounded-md text-xs font-bold shadow flex items-center transition-colors border ${
              status.simulateHighLoad
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
            }`}
          >
            <Zap className={`h-3.5 w-3.5 mr-1.5 ${status.simulateHighLoad ? 'animate-bounce text-rose-400' : ''}`} />
            {status.simulateHighLoad ? 'Yuqori yuklamani o\'chirish' : 'Yuqori yuklamani yoqish'}
          </button>
          <button
            onClick={() => { setRefreshing(true); fetchData(); }}
            disabled={refreshing}
            className="p-2 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-750 text-slate-300 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cloud Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Cpu className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">CPU yuklanishi</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{status.cpuUsage}%</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full"><Clock className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">O'rtacha kechikish</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{status.apiResponseTime} ms</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full"><Wifi className="h-5 w-5" /></div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Shlyuz faolligi (Uptime)</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{status.uptime}%</p>
          </div>
        </div>
      </div>

      {/* VPC Visual Network Layout */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-950 text-base">AWS VPC tarmoq topologiyasi xaritasi</h3>
        <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/50 flex flex-col space-y-6">
          {/* Edge Gateways / CDN */}
          <div className="flex justify-center space-x-8">
            <div className="px-4 py-2.5 bg-brand-900 text-white rounded border border-brand-800 text-center text-xs font-bold shadow-sm">
              <span className="block text-[10px] text-brand-350">GLOBAL EDGE</span>
              CloudFront CDN
            </div>
            <div className="px-4 py-2.5 bg-brand-900 text-white rounded border border-brand-800 text-center text-xs font-bold shadow-sm">
              <span className="block text-[10px] text-brand-350">INTERNET SHLYUZI</span>
              IGW-0091
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-1.5 h-6 bg-slate-350" />
          </div>

          {/* VPC Boundary */}
          <div className="border-2 border-dashed border-slate-350 rounded-lg p-6 bg-slate-100/50 space-y-6 relative">
            <span className="absolute top-2 left-3 text-[10px] font-bold text-slate-500 font-mono">VPC-10293 (10.0.0.0/16)</span>

            {/* Load Balancer */}
            <div className="flex justify-center">
              <div className="px-4 py-2.5 bg-slate-900 text-white rounded border border-slate-800 text-center text-xs font-bold shadow-sm">
                <span className="block text-[10px] text-slate-400">ILOVALAR YUK BALANSLOVCHISI</span>
                ALB-Internal
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-1.5 h-6 bg-slate-350" />
            </div>

            {/* Subnets Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Public Subnet */}
              <div className="border border-slate-200 bg-white rounded-lg p-4 relative space-y-4">
                <span className="absolute top-2 left-3 text-[9px] font-bold text-slate-400 font-mono">Ochiq tarmoq segmenti (Public Subnet 10.0.1.0/24)</span>
                <div className="pt-4 flex flex-col items-center space-y-2">
                  <div className="px-3 py-1.5 bg-success text-white rounded text-xs font-bold shadow-sm">
                    NAT shlyuzi (NAT Gateway)
                  </div>
                  <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded text-xs font-semibold">
                    Bastion xost IP: 10.0.1.200
                  </div>
                </div>
              </div>

              {/* Private Subnet */}
              <div className="border border-slate-200 bg-white rounded-lg p-4 relative space-y-4">
                <span className="absolute top-2 left-3 text-[9px] font-bold text-slate-400 font-mono">Yopiq tarmoq segmenti (Private Subnet 10.0.2.0/24)</span>
                <div className="pt-4 flex flex-col items-center space-y-2">
                  <div className={`px-3.5 py-2 rounded text-xs font-bold shadow-sm transition-all duration-300 ${
                    status.simulateHighLoad ? 'bg-rose-500 text-white animate-pulse' : 'bg-success text-white'
                  }`}>
                    ERP server namunasi ({status.cpuUsage}% CPU)
                  </div>
                  <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded text-xs font-semibold">
                    Postgres MB tuguni: 10.0.2.45
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-950 text-base">CPU va xotira yuklanishi</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="cpuUsage" name="CPU %" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="memoryUsage" name="Xotira %" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-950 text-base">API javob vaqti (kechikish)</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip formatter={(value: any) => [`${value} ms`]} />
                <Line type="monotone" dataKey="apiResponseTime" name="Javob vaqti" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scaling Logs */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-950 text-base flex items-center">
            <Activity className="h-4.5 w-4.5 mr-2 text-slate-500" /> Avtomatik masshtablash hodisalari
          </h3>
          <div className="overflow-x-auto max-h-[260px] overflow-y-auto pr-1">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead>
                <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                  <th className="py-2 px-3">Vaqt tamg'asi</th>
                  <th className="py-2 px-3">Hodisa</th>
                  <th className="py-2 px-3">Tafsilotlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scalingLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/40">
                    <td className="py-2 px-3 font-semibold text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        log.event === 'Scale Out' ? 'bg-blue-50 text-blue-700' : 'bg-slate-150 text-slate-700'
                      }`}>{log.event === 'Scale Out' ? 'Kengaytirish' : log.event === 'Scale In' ? 'Qisqartirish' : log.event}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 leading-normal">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Logs */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-950 text-base flex items-center text-rose-700">
            <ShieldAlert className="h-4.5 w-4.5 mr-2 text-rose-600" /> Xavfsizlik auditi ogohlantirishlari
          </h3>
          <div className="overflow-x-auto max-h-[260px] overflow-y-auto pr-1">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead>
                <tr className="text-left font-semibold text-slate-500 bg-slate-50">
                  <th className="py-2 px-3">Vaqt tamg'asi</th>
                  <th className="py-2 px-3">Xavflilik darajasi</th>
                  <th className="py-2 px-3">Xabar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {securityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/40">
                    <td className="py-2 px-3 font-semibold text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        log.severity === 'HIGH' ? 'bg-rose-50 text-rose-700' :
                        log.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>{log.severity === 'HIGH' ? 'YUQORI' : log.severity === 'MEDIUM' ? 'O\'RTA' : 'PAST'}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 leading-normal">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
