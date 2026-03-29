"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

type MenuSection = {
  label?: string;
  items: NavItem[];
};

// Main menu sections with divider labels
const menuSections: MenuSection[] = [
  {
    // No label - top level items
    items: [
      {
        icon: <GridIcon />,
        name: "Dashboard",
        path: "/",
      },
      {
        icon: <PageIcon />,
        name: "Pages",
        path: "/pages",
      },
    ],
  },
  {
    label: "Main Components",
    items: [
      {
        icon: <BoxCubeIcon />,
        name: "Awards",
        path: "/awards",
      },
      {
        icon: <TableIcon />,
        name: "Management",
        path: "/management",
      },
      {
        icon: <ListIcon />,
        name: "Reports",
        subItems: [
          { name: "Report Types", path: "/reports/report-types" },
          { name: "Report Sections", path: "/reports/report-sections" },
          { name: "Report Items", path: "/reports/report-items" },
        ],
      },
      {
        icon: <ListIcon />,
        name: "Announcements",
        subItems: [
          { name: "Announcements Types", path: "/announcements/announcement-types" },
          { name: "Announcements Sections", path: "/announcements/announcement-sections" },
          { name: "Announcements Items", path: "/announcements/announcement-items" },
        ],
      },
      // {
      //   icon: <CalenderIcon />,
      //   name: "Announcement",
      //   subItems: [
      //     { name: "Announcement Type", path: "/announcement/type" },
      //     { name: "Announcement Section", path: "/announcement/section" },
      //     { name: "Announcement Item", path: "/announcement/item" },
      //   ],
      // },
      {
        icon: <PageIcon />,
        name: "News",
        subItems: [
          { name: "News Category", path: "/news/category" },
          { name: "News Data", path: "/news/data" },
          { name: "News Highlight", path: "/news/highlight" },
        ],
      },
      {
        icon: <BoxCubeIcon />,
        name: "Career",
        path: "/careers",
      },
      {
        icon: <TableIcon />,
        name: "Contact Us Data Bank",
        path: "/contact-data-bank",
      },
      {
        icon: <BoxCubeIcon />,
        name: "File Manager",
        path: "/file-manager",
      },
    ],
  },
  {
    label: "Settings Menu",
    items: [
      {
        icon: <UserCircleIcon />,
        name: "My Profile",
        path: "/profile",
      },
      {
        icon: <UserCircleIcon />,
        name: "Users Management",
        path: "/users-management",
      },
      {
        icon: <GridIcon />,
        name: "Roles & Permissions",
        path: "/roles-permissions",
      },
      {
        icon: <ListIcon />,
        name: "Log Activity",
        path: "/log-activity",
      },
      {
        icon: <PlugInIcon />,
        name: "Settings Page",
        path: "/settings",
      },
      {
        icon: <GridIcon />,
        name: "URL Redirection",
        path: "/url-redirection",
      },
      { icon: <GridIcon />, 
        name: "Menu Management", 
        path: "/menu-management" 
      },
      {
        icon: <PlugInIcon />,
        name: "MFA Setup",
        path: "/mfa-setup",
      },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (items: NavItem[], sectionIndex: number) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const menuKey = `${sectionIndex}-${index}`;
        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(menuKey)}
                className={`menu-item group  ${
                  openSubmenu === menuKey
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={` ${
                    openSubmenu === menuKey
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                      openSubmenu === menuKey ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[menuKey] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu === menuKey
                      ? `${subMenuHeight[menuKey]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  // Check if a path is currently active
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Calculate which submenu should be open based on current path
  const autoOpenSubmenu = useMemo(() => {
    let matchedKey: string | null = null;

    menuSections.forEach((section, sectionIndex) => {
      section.items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (subItem.path === pathname) {
              matchedKey = `${sectionIndex}-${index}`;
            }
          });
        }
      });
    });

    return matchedKey;
  }, [pathname]);

  // Sync openSubmenu with autoOpenSubmenu when pathname changes
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(autoOpenSubmenu);
  
  useEffect(() => {
    setOpenSubmenu(autoOpenSubmenu);
  }, [autoOpenSubmenu]);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Calculate and set submenu height when opened
  useEffect(() => {
    if (openSubmenu !== null && subMenuRefs.current[openSubmenu]) {
      setSubMenuHeight((prevHeights) => ({
        ...prevHeights,
        [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
      }));
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (key: string) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu === key) {
        return null;
      }
      return key;
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`pt-4 pb-6 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={120}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={120}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.label && (
                  <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                      !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "justify-start"
                    }`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? (
                      section.label
                    ) : (
                      <HorizontaLDots />
                    )}
                  </h2>
                )}
                {renderMenuItems(section.items, sectionIndex)}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
