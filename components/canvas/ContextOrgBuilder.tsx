'use client';
import { motion } from 'framer-motion';

interface OrgBuilderProps {
  insights: string[];
}

export function ContextOrgBuilder({ insights }: OrgBuilderProps) {
  // Parse insights for org structure
  const size = insights.find(i => i.toLowerCase().includes('personer'))?.match(/\d+/)?.[0] || '?';
  const roles = insights.filter(i => i.startsWith('Roll:')).map(i => i.split(':')[1].trim());
  const team = insights.find(i => i.startsWith('Team:'))?.split(':')[1] || '';
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Org Snapshot</h3>
      
      {/* Company Size */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="p-4 bg-blue-50 rounded-lg"
      >
        <div className="text-4xl font-bold text-blue-600">{size}</div>
        <div className="text-sm text-gray-600">anställda</div>
      </motion.div>

      {/* Roles Hiring */}
      {roles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Söker:</div>
          {roles.map((role, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 bg-green-50 rounded border-l-4 border-green-500"
            >
              {role}
            </motion.div>
          ))}
        </div>
      )}

      {/* Team Structure */}
      {team && (
        <div className="p-3 bg-gray-50 rounded text-sm text-gray-600">
          {team}
        </div>
      )}
    </div>
  );
}
