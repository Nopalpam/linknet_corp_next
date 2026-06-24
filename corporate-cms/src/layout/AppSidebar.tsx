"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
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
  permissions?: string[];
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; permissions?: string[] }[];
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
        permissions: ["dashboard.read"],
      },
      {
        icon: <PageIcon />,
        name: "Pages",
        path: "/pages",
        permissions: ["pages.read"],
      },
    ],
  },
  {
    label: "Main Components",
    items: [
      // {
      //   icon: <BoxCubeIcon />,
      //   name: "Awards",
      //   path: "/awards",
      //   permissions: ["awards.read"],
      // },
      // // {
      // //   icon: <ListIcon />,
      // //   name: "Data Bank Solutions",
      // //   path: "/solutions",
      // //   permissions: ["solutions.read"],
      // // },
      // {
      //   icon: <TableIcon />,
      //   name: "Management",
      //   path: "/management",
      //   permissions: ["management.read"],
      // },
      {
        icon: <GridIcon />,
        name: "Map Coverage Management",
        path: "/map-coverage",
        permissions: ["map_coverage.read"],
      },
      // {
      //   icon: <ListIcon />,
      //   name: "Reports",
      //   subItems: [
      //     { name: "Report Types", path: "/reports/report-types", permissions: ["reports.read"] },
      //     { name: "Report Sections", path: "/reports/report-sections", permissions: ["reports.read"] },
      //     { name: "Report Items", path: "/reports/report-items", permissions: ["reports.read"] },
      //   ],
      // },
      // {
      //   icon: <ListIcon />,
      //   name: "Announcements",
      //   subItems: [
      //     { name: "Announcements Types", path: "/announcements/announcement-types", permissions: ["announcements.read"] },
      //     { name: "Announcements Sections", path: "/announcements/announcement-sections", permissions: ["announcements.read"] },
      //     { name: "Announcements Items", path: "/announcements/announcement-items", permissions: ["announcements.read"] },
      //   ],
      // },
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
          { name: "News Category", path: "/news/category", permissions: ["news.read"] },
          { name: "News Data", path: "/news/data", permissions: ["news.read"] },
          { name: "News Highlight", path: "/news/highlight", permissions: ["news.read"] },
        ],
      },
      {
        icon: <CalenderIcon />,
        name: "Events",
        path: "/events",
        permissions: ["events.read"],
      },
      // {
      //   icon: <BoxCubeIcon />,
      //   name: "Career",
      //   path: "/careers",
      //   permissions: ["careers.read"],
      // },
      {
        icon: <TableIcon />,
        name: "Contact Us Data Bank",
        path: "/contact-data-bank",
        permissions: ["contact_submissions.read"],
      },
      {
        icon: <PieChartIcon />,
        name: "Cookie Consents",
        path: "/cookie-consents",
        permissions: ["cookie_consents.read"],
      },
      {
        icon: <ListIcon />,
        name: "Form Registration",
        subItems: [
          { name: "Enterprise Forms", path: "/form-modules/enterprise", permissions: ["form_modules.read"] },
          // { name: "Fiber Forms", path: "/form-modules/fiber", permissions: ["form_modules.read"] },
          // { name: "Media Forms", path: "/form-modules/media", permissions: ["form_modules.read"] },
          // { name: "All Submissions", path: "/form-modules/submissions" },
        ],
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
        permissions: ["users_management.read"],
      },
      {
        icon: <GridIcon />,
        name: "Roles & Permissions",
        path: "/roles-permissions",
        permissions: ["role_management.read"],
      },
      {
        icon: <BoxCubeIcon />,
        name: "File Manager",
        path: "/file-manager",
        permissions: ["files.read"],
      },
      {
        icon: <GridIcon />,
        name: "Data Components",
        path: "/component-visibility",
        permissions: ["component_visibility.read"],
      },
      {
        icon: <TableIcon />,
        name: "Label Data Bank",
        path: "/data/label",
        permissions: ["labels.read"],
      },
      {
        icon: <ListIcon />,
        name: "Log Activity",
        path: "/log-activity",
        permissions: ["log_activity.read"],
      },
      {
        icon: <PlugInIcon />,
        name: "Settings Page",
        path: "/settings",
        permissions: ["settings.read"],
      },
      {
        icon: <GridIcon />,
        name: "URL Redirection",
        path: "/url-redirection",
        permissions: ["url_redirection.read"],
      },
      { icon: <GridIcon />, 
        name: "Menu Management", 
        path: "/menu-management",
        permissions: ["menu_management.read"],
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
  const { user } = useAuth();
  const userPermissions = useMemo(() => new Set(user?.permissions || []), [user?.permissions]);
  const isPrivilegedRole = user?.roles?.some((role) => role.slug === "super-admin") || userPermissions.has("*");

  const canAccess = useCallback((permissions?: string[]) => {
    if (!permissions || permissions.length === 0) return true;
    if (isPrivilegedRole) return true;
    return permissions.some((permission) => userPermissions.has(permission));
  }, [isPrivilegedRole, userPermissions]);

  const visibleMenuSections = useMemo(() => (
    menuSections
      .map((section) => {
        const items = section.items
          .map((item) => {
            if (!item.subItems) return canAccess(item.permissions) ? item : null;

            const subItems = item.subItems.filter((subItem) => canAccess(subItem.permissions || item.permissions));
            if (subItems.length === 0 && !canAccess(item.permissions)) return null;

            return { ...item, subItems };
          })
          .filter((item): item is NavItem => Boolean(item));

        return { ...section, items };
      })
      .filter((section) => section.items.length > 0)
  ), [canAccess]);

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

    visibleMenuSections.forEach((section, sectionIndex) => {
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
  }, [pathname, visibleMenuSections]);

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
            {visibleMenuSections.map((section, sectionIndex) => (
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
