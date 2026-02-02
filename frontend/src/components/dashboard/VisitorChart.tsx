"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const VisitorChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week">("week");

  const dailyData = {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    visitors: [890, 1050, 980, 1200, 1100, 950, 870],
    pageViews: [2340, 2890, 2670, 3120, 2980, 2450, 2180],
  };

  const weeklyData = {
    categories: ["Week 1", "Week 2", "Week 3", "Week 4"],
    visitors: [6200, 7100, 6800, 8456],
    pageViews: [18500, 20400, 19800, 23200],
  };

  const currentData = selectedPeriod === "day" ? dailyData : weeklyData;

  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    colors: ["#3C50E0", "#80CAEE"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: currentData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
    },
    grid: {
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "14px",
      fontFamily: "Satoshi, sans-serif",
      fontWeight: 500,
      markers: {
        radius: 99,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.3,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: function (val) {
          return val.toLocaleString();
        },
      },
    },
  };

  const series = [
    {
      name: "Visitors",
      data: currentData.visitors,
    },
    {
      name: "Page Views",
      data: currentData.pageViews,
    },
  ];

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Visitor Analytics
          </h4>
          <p className="text-sm text-bodydark">Traffic overview</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod("day")}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              selectedPeriod === "day"
                ? "bg-primary text-white"
                : "bg-gray-2 text-black dark:bg-meta-4 dark:text-white"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setSelectedPeriod("week")}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              selectedPeriod === "week"
                ? "bg-primary text-white"
                : "bg-gray-2 text-black dark:bg-meta-4 dark:text-white"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div>
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={350}
        />
      </div>
    </div>
  );
};

export default VisitorChart;
