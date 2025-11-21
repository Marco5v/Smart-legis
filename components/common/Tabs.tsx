
import React from 'react';

interface TabsProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab, className = '' }) => {
  return (
    <div className={className}>
      <div className="border-b border-sapv-gray-dark">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-sapv-highlight text-sapv-highlight'
                  : 'border-transparent text-sapv-gray hover:text-sapv-gray-light hover:border-sapv-gray'
              } whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors`}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Tabs;
