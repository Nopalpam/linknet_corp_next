"use client";
import React from "react";

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-gray-300 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
