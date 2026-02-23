"use client";

import React from "react";
import { CareerStats } from "@/services/career.service";

interface Props {
  stats: CareerStats | null;
}

export default function CareerStatsCards({ stats }: Props) {
  const cards = [
    {
      label: "Total",
      value: stats?.total ?? 0,
      color: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: "Active",
      value: stats?.active ?? 0,
      color: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Inactive",
      value: stats?.inactive ?? 0,
      color: "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
    {
      label: "Expired",
      value: stats?.expired ?? 0,
      color: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Published",
      value: stats?.published ?? 0,
      color: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 ${card.color}`}
        >
          <div className="flex-shrink-0">{card.icon}</div>
          <div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs opacity-80">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
