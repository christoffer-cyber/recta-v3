export interface ResearchState {
  isActive: boolean;
  progress: number;
  queries: Array<{
    text: string;
    status: 'pending' | 'active' | 'complete';
    duration?: number;
  }>;
  totalSources?: number;
  totalInsights?: number;
}

export interface ResearchQuery {
  text: string;
  status: 'pending' | 'active' | 'complete';
  startTime?: number;
}

export class ResearchStateManager {
  private state: ResearchState = {
    isActive: false,
    progress: 0,
    queries: [],
    totalSources: 0,
    totalInsights: 0
  };

  private listeners: Array<(state: ResearchState) => void> = [];

  subscribe(listener: (state: ResearchState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  startResearch(queries: string[]) {
    this.state = {
      isActive: true,
      progress: 0,
      queries: queries.map(text => ({
        text,
        status: 'pending' as const
      })),
      totalSources: 0,
      totalInsights: 0
    };
    this.notify();
  }

  updateQueryStatus(index: number, status: 'active' | 'complete') {
    if (index >= 0 && index < this.state.queries.length) {
      const query = this.state.queries[index];
      
      if (status === 'active' && query.status === 'pending') {
        query.status = 'active';
        query.startTime = Date.now();
      } else if (status === 'complete' && query.status === 'active') {
        query.status = 'complete';
        if (query.startTime) {
          query.duration = Date.now() - query.startTime;
        }
      }
      
      this.updateProgress();
      this.notify();
    }
  }

  private updateProgress() {
    const totalQueries = this.state.queries.length;
    const completedQueries = this.state.queries.filter(q => q.status === 'complete').length;
    this.state.progress = totalQueries > 0 ? (completedQueries / totalQueries) * 100 : 0;
  }

  completeResearch(totalSources: number, totalInsights: number) {
    this.state.totalSources = totalSources;
    this.state.totalInsights = totalInsights;
    this.state.progress = 100;
    this.notify();
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.state.isActive = false;
      this.notify();
    }, 3000);
  }

  reset() {
    this.state = {
      isActive: false,
      progress: 0,
      queries: [],
      totalSources: 0,
      totalInsights: 0
    };
    this.notify();
  }

  getState(): ResearchState {
    return { ...this.state };
  }
}

// Singleton instance
export const researchStateManager = new ResearchStateManager();
