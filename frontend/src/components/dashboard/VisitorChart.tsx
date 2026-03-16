"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { dashboardService, ChartDataPoint } from "@/services/dashboard.service";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const VisitorChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "monthly">("daily");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await dashboardService.getVisitorChartData({ period: selectedPeriod });
        setChartData(data.data);
      } catch {
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedPeriod]);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
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
      categories: chartData.map((d) => d.label),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        trim: true,
        maxHeight: 60,
        style: {
          fontSize: "12px",
          fontFamily: "Satoshi, sans-serif",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Satoshi, sans-serif",
        },
        formatter: function (val) {
          return val >= 1000 ? (val / 1000).toFixed(1) + "k" : val.toString();
        },
      },
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
        size: 5,
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
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: {
            height: 280,
          },
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "12px",
          },
          xaxis: {
            labels: {
              rotate: -45,
              rotateAlways: true,
              style: {
                fontSize: "10px",
              },
            },
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Visitors",
      data: chartData.map((d) => d.visitors),
    },
    {
      name: "Page Views",
      data: chartData.map((d) => d.pageViews),
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
            onClick={() => setSelectedPeriod("daily")}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              selectedPeriod === "daily"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 dark:bg-meta-4 dark:text-white"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setSelectedPeriod("monthly")}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              selectedPeriod === "monthly"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 dark:bg-meta-4 dark:text-white"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        {loading ? (
          <div className="flex h-[350px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        ) : (
          <div className="-ml-2 -mr-2">
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={350}
              width="100%"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorChart;
