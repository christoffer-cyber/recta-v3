'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Building2, 
  User, 
  Users, 
  DollarSign, 
  Target, 
  Calendar,
  AlertTriangle,
  Search as SearchIcon,
  Zap,
  Crosshair,
  Star,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

interface Insight {
  category: string;
  text: string;
  timestamp: string;
  isNew?: boolean;
}

interface InsightsFeedProps {
  insights: Insight[];
  maxVisible?: number;
}

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, typeof Lightbulb> = {
  'Företag': Building2,
  'Roll': User,
  'Team': Users,
  'Budget': DollarSign,
  'Mål': Target,
  'Timeline': Calendar,
  'Problem': AlertTriangle,
  'Orsak': SearchIcon,
  'Utmaning': Zap,
  'Scenario': Crosshair,
  'Preferens': Star,
  'Milestone': Target,
  'Nästa steg': ArrowRight
};

export function InsightsFeed({ 
  insights, 
  maxVisible = 5 
}: InsightsFeedProps) {
  const displayInsights = insights.slice(-maxVisible).reverse();
  const hasMore = insights.length > maxVisible;

  const getCategoryIcon = (category: string) => {
    return CATEGORY_ICONS[category] || Lightbulb;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const distance = formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: sv 
      });
      return distance;
    } catch {
      return 'just nu';
    }
  };

  if (insights.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Inga insights än - börja chatta!</p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Insamlade Insights
          </h3>
          {insights.length > 1 && (
            <span className="text-sm text-gray-500">
              ({insights.length})
            </span>
          )}
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {displayInsights.map((insight) => {
            const Icon = getCategoryIcon(insight.category);
            
            return (
              <motion.div
                key={`${insight.category}-${insight.timestamp}`}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  boxShadow: insight.isNew
                    ? [
                        '0 0 0 rgba(59, 130, 246, 0)',
                        '0 0 20px rgba(59, 130, 246, 0.3)',
                        '0 0 0 rgba(59, 130, 246, 0)'
                      ]
                    : '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400,
                  boxShadow: { duration: 2 }
                }}
                className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {insight.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(insight.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {insight.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Totalt: <span className="font-semibold text-gray-900">{insights.length}</span> insights
          </span>
          
          {hasMore && (
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Visa alla
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

