import React, { useState, useEffect } from 'react';
import {
  Zap, TrendingUp, Lock, Unlock, ChevronRight, Info, X, Check, BarChart,
  BarChart3, Clock, Gift, Users, Sparkles, AlertCircle, ArrowRight, Video,
  Star, Crown, Rocket, Award, Target, Activity, Calendar, RefreshCw, FileText,
  Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/apiService';

const DEFAULT_HISTORY = {
  daily: [3, 2, 0, 4, 1, 2, 0],
  weekly: [8, 12, 10, 15]
};

const DEFAULT_TIER = {
  id: 'creator',
  name: 'Creator',
  period: 'monthly',
  icon: '🎬',
  color: 'indigo',
  price: 'Free'
};

const COLOR_PALETTE = ['blue', 'purple', 'green', 'amber', 'indigo'];

const QUOTA_ICON_MAP = {
  videoanalyses: <Video className="w-5 h-5" />,
  aigen: <Sparkles className="w-5 h-5" />,
  aigenarations: <Sparkles className="w-5 h-5" />,
  contentgeneration: <Sparkles className="w-5 h-5" />,
  aigenerations: <Sparkles className="w-5 h-5" />,
  exportreports: <FileText className="w-5 h-5" />,
  exports: <FileText className="w-5 h-5" />,
  storage: <Database className="w-5 h-5" />,
  credits: <Gift className="w-5 h-5" />,
  analyses: <Activity className="w-5 h-5" />
};

const toTitleCase = (str = '') =>
  str
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

const normalizeUsageResponse = (data = {}) => {
  const tierData = {
    ...DEFAULT_TIER,
    ...data.tier,
    icon: data.tier?.icon || data.tier?.emoji || data.tier?.symbol || DEFAULT_TIER.icon,
    color: data.tier?.color || DEFAULT_TIER.color
  };

  const quotasSource = data.quotas || data.limits || {};
  if (!quotasSource || Object.keys(quotasSource).length === 0) {
    quotasSource.videoAnalyses = {
      used: data.analyses || 0,
      limit: data.limit ?? 20,
      remaining:
        data.remaining ??
        (typeof data.limit === 'number' ? Math.max(0, data.limit - (data.analyses || 0)) : 0),
      resetAt: data.nextReset
    };
  }

  const usageCards = Object.entries(quotasSource).map(([key, quota], index) => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
    const limit = typeof quota.limit === 'number' ? quota.limit : quota.max ?? -1;
    const used = quota.used ?? quota.value ?? 0;
    const remaining =
      quota.remaining ??
      (limit > -1 ? Math.max(0, limit - used) : -1);
    const percentage =
      limit && limit > 0 ? (used / limit) * 100 : 0;

    const icon =
      quota.icon ||
      QUOTA_ICON_MAP[normalizedKey] ||
      <Target className="w-5 h-5" />;

    const color = quota.color || COLOR_PALETTE[index % COLOR_PALETTE.length];

    return {
      key,
      title: quota.displayName || quota.label || toTitleCase(key),
      icon,
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

  const primaryQuota =
    usageCards.find((card) => card.key.toLowerCase().includes('video')) ||
    usageCards[0];

  const history =
    (data.history &&
      (Array.isArray(data.history.daily) || Array.isArray(data.history.weekly)) &&
      data.history) ||
    DEFAULT_HISTORY;

  const metrics = {
    totalAnalyses: data.metrics?.totalAnalyses ?? data.totalAnalyses ?? primaryQuota?.usage.used ?? 0,
    avgProcessingTime: data.metrics?.avgProcessingTime ?? data.avgProcessingTime ?? null,
    fastestAnalysis: data.metrics?.fastestAnalysis ?? null,
    savedHours: data.metrics?.savedHours ?? null,
    satisfaction: data.metrics?.satisfaction ?? data.csat ?? null
  };

  const platformBreakdown =
    data.platformBreakdown ||
    data.platformInsights ||
    data.platformPerformance ||
    [];

  const recentAnalyses =
    data.recentAnalyses ||
    data.latestAnalyses ||
    data.recentActivity ||
    [];

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

// Main Usage Dashboard
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
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      // 1. Fetch Usage Data (Critical)
      let usage;
      try {
        usage = await ApiService.getUsage(accessToken);
      } catch (err) {
        console.error('Failed to fetch usage:', err);
        // If usage fails, we can't do much, but we'll try to proceed with default
        usage = {};
      }

      const normalizedUsage = normalizeUsageResponse(usage);

      // 2. Fetch History Data (Non-Critical)
      try {
        const historyData = await ApiService.getAnalysisHistory(accessToken, 100);

        // Merge history data if available
        if (historyData && historyData.items) {
          normalizedUsage.recentAnalyses = historyData.items;

          // Update metrics if available from history
          if (historyData.total !== undefined) {
            normalizedUsage.metrics.totalAnalyses = historyData.total;

            // Also update the video analyses quota card
            const videoQuotaIndex = normalizedUsage.usageCards.findIndex(
              card => card.key === 'videoAnalyses' || card.key === 'videoanalyses'
            );

            if (videoQuotaIndex !== -1) {
              const card = normalizedUsage.usageCards[videoQuotaIndex];
              const limit = card.usage.limit;
              const used = historyData.total;
              const remaining = limit > -1 ? Math.max(0, limit - used) : -1;
              const percentage = limit && limit > 0 ? (used / limit) * 100 : 0;

              normalizedUsage.usageCards[videoQuotaIndex] = {
                ...card,
                usage: {
                  ...card.usage,
                  used,
                  remaining,
                  percentage: Math.min(100, Math.max(0, percentage))
                }
              };

              // Update primary quota reference if it was this card
              if (normalizedUsage.primaryQuota.key === card.key) {
                normalizedUsage.primaryQuota = normalizedUsage.usageCards[videoQuotaIndex];
              }
            }
            // Calculate daily history (Last 7 days)
            const last7Days = [...Array(7)].map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              return d.toISOString().split('T')[0];
            });

            const dailyCounts = last7Days.map(date => {
              return historyData.items.filter(item =>
                item.created_at && item.created_at.startsWith(date)
              ).length;
            });

            normalizedUsage.history.daily = dailyCounts;

            // Calculate weekly history (Last 4 weeks)
            const weeklyCounts = [...Array(4)].map((_, i) => {
              // Index 0 = 4 weeks ago, Index 3 = Current week
              const weekEnd = new Date();
              weekEnd.setDate(weekEnd.getDate() - ((3 - i) * 7));
              // Set to end of day
              weekEnd.setHours(23, 59, 59, 999);

              const weekStart = new Date(weekEnd);
              weekStart.setDate(weekStart.getDate() - 7);
              // Set to start of day (technically next ms after prev week end)

              return historyData.items.filter(item => {
                if (!item.created_at) return false;
                const itemDate = new Date(item.created_at);
                return itemDate > weekStart && itemDate <= weekEnd;
              }).length;
            });

            normalizedUsage.history.weekly = weeklyCounts;
          }
        }
      } catch (historyError) {
        console.warn('Failed to fetch history data:', historyError);
        // Continue with usage data only
      }

      setUsageData(normalizedUsage);
    } catch (error) {
      console.error('Error in dashboard data fetch:', error);
      setUsageData(normalizeUsageResponse());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <UsageLoadingSkeleton />;
  }

  const { primaryQuota } = usageData;
  const remainingAnalyses = primaryQuota?.unlimited ? '∞' : primaryQuota?.usage.remaining ?? 0;
  const disableAnalysis = !primaryQuota?.unlimited && (primaryQuota?.usage.remaining ?? 0) <= 0;

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={fetchUsageData}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Metrics */}
        {usageData.metrics && (
          <UsageMetrics metrics={usageData.metrics} />
        )}

        {/* Quick Actions */}
        <QuickActions
          remaining={remainingAnalyses}
          unlimited={primaryQuota?.usage.limit === -1}
          disableAnalyze={disableAnalysis}
          onAnalyze={() => {
            if (onNavigate) {
              onNavigate('upload');
            } else if (typeof window !== 'undefined') {
              window.location.hash = 'upload';
            }
          }}
          onUpgrade={() => setShowUpgradeModal(true)}
        />

        {/* Current Tier Card */}
        <CurrentTierCard
          tier={usageData.tier}
          onUpgrade={() => setShowUpgradeModal(true)}
        />

        {/* Usage Overview Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usageData.usageCards?.map((card) => (
            <UsageCard
              key={card.key}
              title={card.title}
              icon={card.icon}
              usage={card.usage}
              color={card.color}
              unlimited={card.unlimited}
              onLimit={() => {
                setSelectedFeature(card.key);
                setShowUpgradeModal(true);
              }}
            />
          ))}
        </div>

        {/* Usage History Chart */}
        <UsageHistoryChart history={usageData.history} />

        {/* Analysis History */}
        <AnalysisHistory items={usageData.recentAnalyses || []} />

        {/* Platform Breakdown */}
        {usageData.platformBreakdown?.length > 0 && (
          <PlatformBreakdown data={usageData.platformBreakdown} />
        )}

        {/* Badges */}
        {usageData.badges?.length > 0 && (
          <BadgeShowcase badges={usageData.badges} />
        )}

        {/* Upgrade Modal */}
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
    </div>
  );
};

// Current Tier Card Component
const CurrentTierCard = ({ tier, onUpgrade }) => {
  const tierColors = {
    explorer: 'bg-gray-500',
    creator: 'bg-indigo-500',
    professional: 'bg-purple-500',
    studio: 'bg-gradient-to-r from-amber-500 to-orange-500'
  };

  const tierIcons = {
    explorer: <Star className="w-6 h-6" />,
    creator: <Zap className="w-6 h-6" />,
    professional: <Crown className="w-6 h-6" />,
    studio: <Rocket className="w-6 h-6" />
  };

  const renderIcon = () => {
    if (tierIcons[tier.id]) return tierIcons[tier.id];
    if (typeof tier.icon === 'string') {
      return <span className="text-2xl">{tier.icon}</span>;
    }
    return <Zap className="w-6 h-6" />;
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl ${tierColors[tier.id] || 'bg-gray-500'} text-white p-8`}>
      <div className="absolute top-0 right-0 opacity-10">
        <div className="w-64 h-64 rounded-full bg-white transform translate-x-20 -translate-y-20" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {renderIcon()}
              <span className="text-sm font-medium opacity-90">CURRENT PLAN</span>
            </div>
            <h2 className="text-5xl font-artistic tracking-wider mb-2">{tier.name}</h2>
            {tier.price && (
              <p className="text-white/90 text-sm mb-2">{tier.price}</p>
            )}
            <p className="text-white/80">
              Resets {tier.period === 'monthly' ? 'monthly' : 'weekly'}
            </p>
          </div>

          <button
            onClick={onUpgrade}
            className="btn-liquid-glass px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            Upgrade
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Usage Card Component
const UsageCard = ({ title, icon, usage, color, unlimited = false, onLimit }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500'
  };

  const bgColorClasses = {
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    green: 'bg-green-50',
    amber: 'bg-amber-50'
  };

  const isNearLimit = usage.percentage > 80;
  const hasReachedLimit = usage.percentage >= 100;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bgColorClasses[color]}`}>
            <div className={`${colorClasses[color]} text-white rounded-md p-1`}>
              {icon}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {unlimited ? (
              <p className="text-sm text-green-600 font-medium">Unlimited</p>
            ) : (
              <p className="text-sm text-gray-500">
                {usage.used} of {usage.limit} used
              </p>
            )}
          </div>
        </div>

        {!unlimited && isNearLimit && (
          <div className={`p-1 rounded-full ${hasReachedLimit ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertCircle className={`w-4 h-4 ${hasReachedLimit ? 'text-red-600' : 'text-amber-600'}`} />
          </div>
        )}
      </div>

      {!unlimited && (
        <>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Usage</span>
              <span className={`font-medium ${hasReachedLimit ? 'text-red-600' : 'text-gray-900'}`}>
                {usage.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${hasReachedLimit
                  ? 'bg-red-500'
                  : isNearLimit
                    ? 'bg-amber-500'
                    : colorClasses[color]
                  }`}
                style={{ width: `${Math.min(100, usage.percentage)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Resets {formatDate(usage.willResetAt)}
            </p>
            {hasReachedLimit && (
              <button
                onClick={onLimit}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Get more →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Usage History Chart
const UsageHistoryChart = ({ history }) => {
  const [view, setView] = useState('daily');
  const data = view === 'daily' ? history.daily : history.weekly;
  const maxValue = Math.max(...data, 1);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-3xl font-artistic text-gray-900">Usage History</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setView('daily')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${view === 'daily'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${view === 'weekly'
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="relative h-40">
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="text-xs text-gray-600 mb-1">{value}</div>
              <div
                className="w-full bg-indigo-500 rounded-t transition-all duration-500 hover:bg-indigo-600"
                style={{ height: `${(value / maxValue) * 100}%` }}
              />
              <div className="text-xs text-gray-500 mt-2">
                {view === 'daily'
                  ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]
                  : `W${index + 1}`
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Quick Actions
const QuickActions = ({ remaining, onAnalyze, onUpgrade, unlimited = false, disableAnalyze = false }) => {
  const isUnlimited = unlimited || remaining === '∞';
  const remainingLabel = isUnlimited ? '∞' : remaining;
  const numericRemaining = isUnlimited ? Infinity : Number(remaining) || 0;
  const showUpgradeCta = !isUnlimited && numericRemaining < 5;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-4xl font-artistic mb-2">Ready to analyze?</h3>
          <p className="text-white/80">
            You have <span className="font-bold">{remainingLabel}</span> analyses remaining this period
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onAnalyze}
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-transform hover:-translate-y-0.5 flex items-center gap-2"

          >
            <Video className="w-5 h-5" />
            Analyze Video
          </button>
          {showUpgradeCta && (
            <button
              onClick={onUpgrade}
              className="btn-liquid-glass text-white px-6 py-3 rounded-lg font-semibold"
            >
              Get More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const UsageMetrics = ({ metrics }) => {
  const metricCards = [
    {
      label: 'Total Analyses',
      value: metrics.totalAnalyses
    },
    {
      label: 'Avg Processing Time',
      value: metrics.avgProcessingTime ? `${metrics.avgProcessingTime}s` : null
    },
    {
      label: 'Fastest Analysis',
      value: metrics.fastestAnalysis ? `${metrics.fastestAnalysis}s` : null
    },
    {
      label: 'Hours Saved',
      value: metrics.savedHours ? `${metrics.savedHours}h` : null
    },
    {
      label: 'Satisfaction',
      value: metrics.satisfaction ? `${metrics.satisfaction}%` : null
    }
  ].filter((metric) => metric.value !== null && metric.value !== undefined);

  if (!metricCards.length) return null;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metricCards.map((metric) => (
        <div key={metric.label} className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
          <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
        </div>
      ))}
    </div>
  );
};

const PlatformBreakdown = ({ data }) => {
  if (!data.length) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-3xl font-artistic text-gray-900">Platform Performance</h3>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <BarChart className="w-4 h-4" />
          Last 30 days
        </div>
      </div>
      <div className="space-y-4">
        {data.map((platform, index) => (
          <div key={`${platform.platform || platform.name || index}-${index}`} className="flex items-center justify-between border border-gray-100 rounded-lg p-4">
            <div>
              <p className="font-semibold text-gray-900">
                {platform.displayName || platform.platform || platform.name || 'Platform'}
              </p>
              {platform.lastAnalyzed && (
                <p className="text-xs text-gray-500">
                  Last analyzed {new Date(platform.lastAnalyzed).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-6">
              {typeof platform.score === 'number' && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Score</p>
                  <p className="text-xl font-semibold text-indigo-600">{Math.round(platform.score)}</p>
                </div>
              )}
              {typeof platform.usage === 'number' && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Analyses</p>
                  <p className="text-xl font-semibold text-gray-900">{platform.usage}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalysisHistory = ({ items }) => {
  // Always render the component, even if empty
  const limitedItems = items.slice(0, 10); // Show up to 10 items

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-3xl font-artistic text-gray-900">Analysis History</h3>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Latest activity
        </div>
      </div>

      {limitedItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No analysis history yet.</p>
          <p className="text-sm mt-1">Start analyzing videos to see them here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {limitedItems.map((item, index) => {
            // Extract score and platform from item
            // Handle different possible data structures
            const score = item.score ||
              (item.analysis_results?.score) ||
              (item.result?.score) ||
              0;

            const platform = item.platform ||
              (item.analysis_results?.platform) ||
              (item.result?.platform) ||
              'Unknown';

            const insights = item.insights ||
              (item.analysis_results?.insights) ||
              (item.result?.insights) ||
              [];

            const bestPlatform = Array.isArray(insights) && insights.length > 0
              ? insights[0].platform || platform
              : platform;

            return (
              <div key={`${item.id || item.title || index}-${index}`} className="flex items-center justify-between border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900">{item.title || item.videoTitle || `Analysis ${index + 1}`}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recently'}
                    </span>
                    {bestPlatform && bestPlatform !== 'Unknown' && (
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                        {bestPlatform}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Viral Score</p>
                  <div className="flex items-center justify-end gap-1">
                    <span className={`text-xl font-semibold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-indigo-600' : 'text-amber-600'}`}>
                      {score ? Math.round(score) : '-'}
                    </span>
                    <span className="text-xs text-gray-400">/100</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const BadgeShowcase = ({ badges }) => {
  const limitedBadges = badges.slice(0, 6);
  if (!limitedBadges.length) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl p-6">
      <h3 className="text-3xl font-artistic text-gray-900 mb-4">Achievements</h3>
      <div className="flex flex-wrap gap-3">
        {limitedBadges.map((badge, index) => (
          <div
            key={`${badge.id || badge.title || index}-${index}`}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full border border-indigo-100"
          >
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">{badge.title || badge.name || 'Milestone unlocked'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Upgrade Modal
const UpgradeModal = ({ currentTier, feature, onClose, onUpgrade }) => {
  const [selectedTier, setSelectedTier] = useState('professional');

  const tiers = [
    {
      id: 'creator',
      name: 'Creator',
      price: 'Free',
      period: 'month',
      icon: <Zap className="w-6 h-6" />,
      color: 'indigo',
      popular: true,
      features: [
        '<strong>20 Analyses/month:</strong> Perfect for getting started.',
        '<strong>Deep Analysis:</strong> Emotional & engagement insights.',
        '<strong>Platform Recommendations:</strong> Find your ideal audience.',
      ],
      limits: {
        videoAnalyses: 20,
        contentGeneration: 10,
        exportReports: true,
        teamMembers: 1
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 'Coming Soon',
      period: 'month',
      icon: <Crown className="w-6 h-6" />,
      color: 'purple',
      features: [
        '<strong>Everything in Creator, plus:</strong>',
        '<strong>Long-Form Video Analysis:</strong> For detailed content reviews.',
        '<strong>Video Repurposing:</strong> AI-driven content adaptation.',
        '<strong>AI Script Generation:</strong> Create compelling scripts in seconds.',
        '<strong>And much more...</strong>'
      ],
      limits: {
        videoAnalyses: 100,
        contentGeneration: 50,
        exportReports: true,
        teamMembers: 3
      }
    },
    {
      id: 'studio',
      name: 'Studio',
      price: 'Coming Soon',
      period: 'month',
      icon: <Rocket className="w-6 h-6" />,
      color: 'amber',
      features: [
        '<strong>Everything in Professional, plus:</strong>',
        '<strong>AI Thumbnail Generation:</strong> Create click-worthy thumbnails.',
        '<strong>Export PDF Reports:</strong> Professional, shareable insights.',
        '<strong>Team Collaboration:</strong> Advanced team features.',
        '<strong>And much more...</strong>'
      ],
      limits: {
        videoAnalyses: 500,
        contentGeneration: -1,
        exportReports: true,
        teamMembers: -1
      }
    }
  ];

  const getComparisonValue = (tierId, feature) => {
    const tier = tiers.find(t => t.id === tierId);
    if (!tier) return '-';

    const value = tier.limits[feature];
    if (value === -1) return '∞';
    if (value === true) return '✓';
    if (value === false) return '-';
    return value;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-5xl font-artistic tracking-wider mb-2">Choose Your Plan</h2>
              <p className="text-white/80">
                Unlock more analyses and features to grow your content
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {feature && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p>You've reached your limit for <strong>{feature}</strong>. Upgrade to continue.</p>
            </div>
          )}
        </div>

        {/* Tiers Grid */}
        <div className="p-8 overflow-y-auto no-scrollbar">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {tiers.map(tier => (
              <TierCard
                key={tier.id}
                tier={tier}
                isSelected={selectedTier === tier.id}
                isCurrent={currentTier.id === tier.id}
                onSelect={() => setSelectedTier(tier.id)}
              />
            ))}
          </div>

          {/* Comparison Table */}
          <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-3xl font-artistic mb-4">Feature Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 text-sm font-medium text-gray-600">Feature</th>
                    {tiers.map(tier => (
                      <th key={tier.id} className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 pr-4 text-sm text-gray-700">Video Analyses</td>
                    {tiers.map(tier => (
                      <td key={tier.id} className="px-4 py-3 text-center text-sm font-medium">
                        {getComparisonValue(tier.id, 'videoAnalyses')}
                        {tier.limits.videoAnalyses > 0 && (
                          <span className="text-gray-500">/{tier.period}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4 text-sm text-gray-700">AI Generations</td>
                    {tiers.map(tier => (
                      <td key={tier.id} className="px-4 py-3 text-center text-sm font-medium">
                        {getComparisonValue(tier.id, 'contentGeneration')}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 pr-4 text-sm text-gray-700">Export Reports</td>
                    {tiers.map(tier => (
                      <td key={tier.id} className="px-4 py-3 text-center text-sm">
                        {tier.limits.exportReports ? (
                          <Check className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-sm text-gray-700">Team Members</td>
                    {tiers.map(tier => (
                      <td key={tier.id} className="px-4 py-3 text-center text-sm font-medium">
                        {getComparisonValue(tier.id, 'teamMembers')}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Maybe Later
            </button>
            <button
              onClick={() => onUpgrade(selectedTier)}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
              disabled={currentTier.id === selectedTier}
            >
              {currentTier.id === selectedTier ? (
                <>Current Plan</>
              ) : (
                <>
                  Upgrade to {tiers.find(t => t.id === selectedTier)?.name}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tier Card Component
const TierCard = ({ tier, isSelected, isCurrent, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const borderColors = {
    gray: isSelected ? 'border-gray-500' : 'border-gray-200',
    indigo: isSelected ? 'border-indigo-500' : 'border-gray-200',
    purple: isSelected ? 'border-purple-500' : 'border-gray-200',
    amber: isSelected ? 'border-amber-500' : 'border-gray-200'
  };

  const bgColors = {
    gray: 'bg-gray-100',
    indigo: 'bg-indigo-100',
    purple: 'bg-purple-100',
    amber: 'bg-amber-100'
  };

  const featuresToShow = isExpanded ? tier.features : tier.features.slice(0, 4);

  return (
    <div
      className={`relative bg-white/80 backdrop-blur-sm rounded-xl border-2 p-6 cursor-pointer transition-all ${borderColors[tier.color]
        } ${isSelected ? 'shadow-lg scale-105' : 'hover:shadow-md'}`}
      onClick={onSelect}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
            Current
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${bgColors[tier.color]}`}>
          {tier.icon}
        </div>
        {isSelected && (
          <div className={`w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center`}>
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-2xl font-bold">{tier.price}</span>
        {tier.price !== 'Free' && tier.price !== 'Custom' && (
          <span className="text-gray-500">/{tier.period}</span>
        )}
      </div>

      <ul className="space-y-2">
        {featuresToShow.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: feature }} />
          </li>
        ))}
        {tier.features.length > 4 && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card selection when clicking the button
              setIsExpanded(!isExpanded);
            }}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2"
          >
            {isExpanded ? 'Show less' : `+${tier.features.length - 4} more features...`}
          </button>
        )}
      </ul>
    </div>
  );
};

// Loading Skeleton
const UsageLoadingSkeleton = () => {
  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
};

// Helper function
const formatDate = (date) => {
  const days = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
};

export default UsageDashboard;
