'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TabsData } from '@/types/component';

interface TabsProps {
  data: TabsData;
}

export default function Tabs({ data }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const getNavClass = () => {
    switch (data.style) {
      case 'pills':
        return 'nav-pills';
      case 'underline':
        return 'nav-underline';
      default:
        return 'nav-tabs';
    }
  };

  return (
    <section className="tabs-section py-5">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {/* Tab Navigation */}
          <ul className={`nav ${getNavClass()} mb-4`}>
            {data.tabs.map((tab, index) => (
              <li key={index} className="nav-item">
                <button
                  className={`nav-link ${activeTab === index ? 'active' : ''}`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab.icon && <i className={`${tab.icon} me-2`} />}
                  {tab.title}
                </button>
              </li>
            ))}
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {data.tabs.map((tab, index) => (
              <motion.div
                key={index}
                className={`tab-pane ${activeTab === index ? 'active' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: activeTab === index ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: activeTab === index ? 'block' : 'none' }}
              >
                <div dangerouslySetInnerHTML={{ __html: tab.content }} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
