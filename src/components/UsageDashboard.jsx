import React, { useState, useEffect } from 'react';
import {
  Zap, TrendingUp, Lock, Unlock, ChevronRight, Info, X, Check, BarChart,
  BarChart3, Clock, Gift, Users, Sparkles, AlertCircle, ArrowRight, Video,
  Star, Crown, Rocket, Award, Target, Activity, Calendar, RefreshCw, FileText,
  Database, LayoutDashboard, PieChart, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/apiService';

// --- Constants & Config ---

const DEFAULT_HISTORY = {
  daily: [0, 0, 0, 0, 0, 0, 0],
  weekly: [0, 0, 0, 0]
};

const DEFAULT_TIER = {
  id: 'creator',
  name: 'Creator',
  period: 'monthly',
  icon: 'Zap', // String reference to icon
  color: 'indigo',
  price: 'Free'
};

const COLOR_PALETTE = ['blue', 'purple', 'green', 'amber', 'indigo', 'rose', 'cyan'];

const QUOTA_ICON_MAP = {
  videoanalyses: Video,
  aigen: Sparkles,
  aigenarations: Sparkles,
  contentgeneration: Sparkles,
  aigenerations: Sparkles,
  exportreports: FileText,
  exports: FileText,
  storage: Database,
  credits: Gift,
  analyses: Activity,
  default: Target
};

// --- Helpers ---

const toTitleCase = (str = '') =>
  str
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const days = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
};

const normalizeUsageResponse = (data = {}) => {
  // Normalize Tier
  const tierData = {
    ...DEFAULT_TIER,
    ...data.tier,
    id: (data.tier?.id === 'explorer' ? 'creator' : data.tier?.id) || DEFAULT_TIER.id,
    name: (data.tier?.id === 'explorer' ? 'Creator' : data.tier?.name) || DEFAULT_TIER.name,
    // Ensure we don't use emojis from backend if possible, or map them
    icon: data.tier?.icon && !data.tier.icon.match(/\p{Emoji}/u) ? data.tier.icon : DEFAULT_TIER.icon,
    color: (data.tier?.id === 'explorer' ? 'indigo' : data.tier?.color) || DEFAULT_TIER.color
  };

  // Normalize Quotas
  const quotasSource = data.quotas || data.limits || {};
  if (!quotasSource || Object.keys(quotasSource).length === 0) {
    // Fallback if no quotas returned
    quotasSource.videoAnalyses = {
      used: data.analyses || 0,
      limit: data.limit ?? 20,
      remaining: data.remaining ?? (typeof data.limit === 'number' ? Math.max(0, data.limit - (data.analyses || 0)) : 0),
      resetAt: data.nextReset
    };
  }

  const usageCards = Object.entries(quotasSource).map(([key, quota], index) => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
    const limit = typeof quota.limit === 'number' ? quota.limit : quota.max ?? -1;
    const used = quota.used ?? quota.value ?? 0;
    const remaining = quota.remaining ?? (limit > -1 ? Math.max(0, limit - used) : -1);
    const percentage = limit && limit > 0 ? (used / limit) * 100 : 0;

    // Resolve Icon Component
    const IconComponent = QUOTA_ICON_MAP[normalizedKey] || QUOTA_ICON_MAP.default;

    const color = quota.color || COLOR_PALETTE[index % COLOR_PALETTE.length];

    return {
      key,
      title: quota.displayName || quota.label || toTitleCase(key),
      Icon: IconComponent,
      color,
      unlimited: limit === -1 || limit === null,
      usage: {
        used,
        limit,
        remaining,
        percentage: Math.min(100, Math.max(0, percentage)),
        willResetAt: quota.resetAt ? new Date(quota.resetAt) : data.nextReset ? new Date(data.nextReset) : null
      }
    };
  });

  const primaryQuota = usageCards.find((card) => card.key.toLowerCase().includes('video')) || usageCards[0];

  const history = (data.history && (Array.isArray(data.history.daily) || Array.isArray(data.history.weekly)) && data.history) || DEFAULT_HISTORY;

  const metrics = {
    totalAnalyses: data.metrics?.totalAnalyses ?? data.totalAnalyses ?? primaryQuota?.usage.used ?? 0,
    avgProcessingTime: data.metrics?.avgProcessingTime ?? data.avgProcessingTime ?? null,
    fastestAnalysis: data.metrics?.fastestAnalysis ?? null,
    savedHours: data.metrics?.savedHours ?? null,
    satisfaction: data.metrics?.satisfaction ?? data.csat ?? null
  };

  const platformBreakdown = data.platformBreakdown || data.platformInsights || data.platformPerformance || [];
  const recentAnalyses = data.recentAnalyses || data.latestAnalyses || data.recentActivity || [];
  const badges = data.badges || data.achievements || [];
  const nextTier = data.nextTier || null;

  return {
    tier: tierData,
    usageCards,
    primaryQuota,
    history,
    nextTier,
    metrics,
    platformBreakdown,
    recentAnalyses,
    badges
  };
};

// --- Components ---

const UsageDashboard = ({ userId, language = 'en', onNavigate }) => {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const { getAccessToken } = useAuth();

  useEffect(() => {
    fetchUsageData();
  }, [userId]);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('Authentication required');

      let usage;
      try {
        usage = await ApiService.getUsage(accessToken);
      } catch (err) {
        console.error('Failed to fetch usage:', err);
        usage = {};
      }

      const normalizedUsage = normalizeUsageResponse(usage);

      // Fetch History if possible
      try {
        const historyData = await ApiService.getAnalysisHistory(accessToken, 100);
        if (historyData && historyData.items) {
          normalizedUsage.recentAnalyses = historyData.items;
          if (historyData.total !== undefined) {
            normalizedUsage.metrics.totalAnalyses = historyData.total;
            // Update video quota logic here similar to original...
            // (Simplified for brevity, assuming backend sync is better, but keeping basic update)
            const videoQuotaIndex = normalizedUsage.usageCards.findIndex(
              card => card.key.toLowerCase().includes('video')
            );
            if (videoQuotaIndex !== -1) {
              const card = normalizedUsage.usageCards[videoQuotaIndex];
              if (card.usage.limit > 0) {
                card.usage.used = historyData.total;
                card.usage.remaining = Math.max(0, card.usage.limit - historyData.total);
                card.usage.percentage = (historyData.total / card.usage.limit) * 100;
              }
            }
          }
          // Calculate daily/weekly history (Simplified logic from original)
          // ... (Keeping it simple for now to focus on UI)
        }
      } catch (e) {
        console.warn('History fetch failed', e);
      }

      setUsageData(normalizedUsage);
    } catch (error) {
      console.error('Dashboard error:', error);
      setUsageData(normalizeUsageResponse());
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <UsageLoadingSkeleton />;

  const { primaryQuota } = usageData;
  const remainingAnalyses = primaryQuota?.unlimited ? '∞' : primaryQuota?.usage.remaining ?? 0;
  const disableAnalysis = !primaryQuota?.unlimited && (primaryQuota?.usage.remaining ?? 0) <= 0;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back! Here's your activity overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsageData}
              disabled={loading}
              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white bg-white/50 border border-slate-200 rounded-xl transition-all shadow-sm hover:shadow-md"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 font-medium"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </div>

        {/* Top Grid: Metrics & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Card */}
          <div className="lg:col-span-2">
            <QuickActions
              remaining={remainingAnalyses}
              unlimited={primaryQuota?.usage.limit === -1}
              disableAnalyze={disableAnalysis}
              onAnalyze={() => onNavigate ? onNavigate('upload') : window.location.hash = 'upload'}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          </div>
          {/* Current Plan Card */}
          <div className="lg:col-span-1">
            <CurrentTierCard
              tier={usageData.tier}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          </div>
        </div>

        {/* Metrics Row */}
        {usageData.metrics && <UsageMetrics metrics={usageData.metrics} />}

        {/* Usage Cards Grid */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" />
            Resource Usage
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usageData.usageCards?.map((card) => (
              <UsageCard
                key={card.key}
                {...card}
                onLimit={() => {
                  setSelectedFeature(card.key);
                  setShowUpgradeModal(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Grid: History & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AnalysisHistory items={usageData.recentAnalyses || []} />
          </div>
          <div className="lg:col-span-1 space-y-6">
            {usageData.platformBreakdown?.length > 0 && (
              <PlatformBreakdown data={usageData.platformBreakdown} />
            )}
            {usageData.badges?.length > 0 && (
              <BadgeShowcase badges={usageData.badges} />
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      {showUpgradeModal && (
        <UpgradeModal
          currentTier={usageData.tier}
          feature={selectedFeature}
          onClose={() => {
            setShowUpgradeModal(false);
            setSelectedFeature(null);
          }}
          onUpgrade={(tier) => {
            console.log('Upgrading to:', tier);
            setShowUpgradeModal(false);
          }}
        />
      )}
    </div>
  );
};

// --- Sub-Components ---

const QuickActions = ({ remaining, onAnalyze, onUpgrade, unlimited, disableAnalyze }) => {
  return (
    <div className="h-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-8 shadow-xl shadow-indigo-900/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 h-full">
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-100">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium tracking-wide text-sm uppercase">Ready to Create</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Start New Analysis</h2>
          <p className="text-indigo-100/90 text-lg max-w-md">
            You have <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md mx-1">{unlimited ? 'Unlimited' : remaining}</span>
            credits remaining this month.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={onAnalyze}
            disabled={disableAnalyze}
            className={`group relative px-6 py-3.5 bg-white text-indigo-600 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 ${disableAnalyze ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
          >
            <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Analyze Video</span>
          </button>
          {!unlimited && (
            <button
              onClick={onUpgrade}
              className="px-6 py-3.5 bg-indigo-800/50 hover:bg-indigo-800/70 text-white border border-indigo-400/30 rounded-xl font-semibold backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              Get More Credits
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CurrentTierCard = ({ tier, onUpgrade }) => {
  const isPro = tier.id !== 'creator' && tier.id !== 'explorer';

  return (
    <div className="h-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${isPro ? 'from-amber-100 to-orange-50' : 'from-indigo-50 to-blue-50'} rounded-bl-full opacity-50 transition-transform group-hover:scale-110`} />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${isPro ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {isPro ? <Crown className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isPro ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              Current Plan
            </span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-1">{tier.name}</h3>
          <p className="text-slate-500 font-medium">{tier.price} / {tier.period}</p>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-slate-500">Next billing</span>
            <span className="font-semibold text-slate-700">Auto-renews</span>
          </div>
          {!isPro && (
            <button
              onClick={onUpgrade}
              className="w-full py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Upgrade to Pro <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const UsageCard = ({ title, Icon, usage, color, unlimited, onLimit }) => {
  const percentage = Math.min(100, Math.max(0, usage.percentage));
  const isNearLimit = !unlimited && percentage > 85;
  const isLimitReached = !unlimited && percentage >= 100;

  const colorMap = {
    indigo: 'text-indigo-600 bg-indigo-100',
    purple: 'text-purple-600 bg-purple-100',
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    amber: 'text-amber-600 bg-amber-100',
    rose: 'text-rose-600 bg-rose-100',
    cyan: 'text-cyan-600 bg-cyan-100',
  };

  const barColorMap = {
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    amber: 'bg-amber-600',
    rose: 'bg-rose-600',
    cyan: 'bg-cyan-600',
  };

  const themeClass = colorMap[color] || colorMap.indigo;
  const barClass = isLimitReached ? 'bg-red-500' : (isNearLimit ? 'bg-amber-500' : (barColorMap[color] || 'bg-indigo-600'));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${themeClass} group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              {unlimited ? 'Unlimited Access' : 'Monthly Quota'}
            </p>
          </div>
        </div>
        {isLimitReached && (
          <div className="text-red-500 bg-red-50 p-1.5 rounded-lg animate-pulse">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {!unlimited ? (
          <>
            <div className="flex justify-between items-end">
              <div className="text-2xl font-bold text-slate-900">
                {usage.used}
                <span className="text-sm text-slate-400 font-normal ml-1">/ {usage.limit}</span>
              </div>
              <span className={`text-sm font-medium ${isLimitReached ? 'text-red-600' : 'text-slate-600'}`}>
                {percentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barClass} transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-slate-400">Resets {formatDate(usage.willResetAt)}</span>
              {isNearLimit && (
                <button onClick={onLimit} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Increase Limit
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="py-2">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg w-fit">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Active & Unlimited</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UsageMetrics = ({ metrics }) => {
  const items = [
    { label: 'Total Analyses', value: metrics.totalAnalyses, icon: Activity, color: 'text-blue-600' },
    { label: 'Avg Time', value: metrics.avgProcessingTime ? `${metrics.avgProcessingTime}s` : '-', icon: Clock, color: 'text-purple-600' },
    { label: 'Hours Saved', value: metrics.savedHours || '-', icon: Clock, color: 'text-green-600' },
    { label: 'Satisfaction', value: metrics.satisfaction ? `${metrics.satisfaction}%` : '-', icon: Star, color: 'text-amber-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-200 transition-colors">
          <div className={`p-2 rounded-lg bg-slate-50 ${item.color}`}>
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{item.label}</p>
            <p className="text-xl font-bold text-slate-900">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const AnalysisHistory = ({ items }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-slate-400" />
          Recent Analyses
        </h3>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <LayoutDashboard className="w-6 h-6 text-slate-300" />
            </div>
            <p>No analyses yet. Start your first one!</p>
          </div>
        ) : (
          items.slice(0, 5).map((item, idx) => {
            const score = item.score || item.analysis_results?.score || 0;
            return (
              <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {score > 0 ? score : '-'}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.title || item.videoTitle || `Analysis #${idx + 1}`}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just now'}
                      <span>•</span>
                      {item.platform || 'General'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {score >= 80 ? 'Viral' : score >= 50 ? 'Good' : 'Average'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const PlatformBreakdown = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-slate-400" />
        Top Platforms
      </h3>
      <div className="space-y-4">
        {data.map((p, i) => (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">{p.platform || p.name}</span>
              <span className="text-slate-500">{p.usage} analyses</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, (p.usage / 20) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BadgeShowcase = ({ badges }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-500" />
        Achievements
      </h3>
      <div className="flex flex-wrap gap-2">
        {badges.map((b, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            {b.title || b.name}
          </span>
        ))}
      </div>
    </div>
  );
};

const UpgradeModal = ({ currentTier, feature, onClose, onUpgrade }) => {
  const tiers = [
    { id: 'creator', name: 'Creator', price: 'Free', icon: Zap, features: ['20 Analyses/mo', 'Basic Insights'] },
    { id: 'professional', name: 'Pro', price: '$29', icon: Crown, features: ['100 Analyses/mo', 'Deep Insights', 'Export Reports'], popular: true },
    { id: 'studio', name: 'Studio', price: '$99', icon: Rocket, features: ['Unlimited', 'Team Access', 'API Access'] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
        <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-600 to-violet-700 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">Upgrade your Plan</h2>
                <p className="text-indigo-100">Unlock more power for your content journey.</p>
              </div>
              <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            {feature && (
              <div className="mt-6 bg-white/10 border border-white/20 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-300" />
                <p className="text-sm">You reached the limit for <span className="font-bold">{toTitleCase(feature)}</span>.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-xl border-2 p-6 relative transition-all ${tier.popular ? 'border-indigo-500 bg-indigo-50/50 shadow-lg scale-105' : 'border-slate-100 hover:border-indigo-200'}`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}
              <div className="flex justify-between items-center mb-4">
                <div className={`p-3 rounded-lg ${tier.popular ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                  <tier.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">{tier.name}</h3>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-slate-900">{tier.price}</span>
                {tier.price !== 'Free' && <span className="text-slate-500">/mo</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onUpgrade(tier.id)}
                disabled={currentTier.id === tier.id}
                className={`w-full py-3 rounded-xl font-semibold transition-colors ${currentTier.id === tier.id
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : tier.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600'
                  }`}
              >
                {currentTier.id === tier.id ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UsageLoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-8 space-y-8 animate-pulse">
    <div className="h-10 w-48 bg-slate-200 rounded-lg" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-64 bg-slate-200 rounded-2xl" />
      <div className="h-64 bg-slate-200 rounded-2xl" />
    </div>
    <div className="grid grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
    </div>
  </div>
);

export default UsageDashboard;
