import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { ACCOUNTANT_ROLE, ADMIN_ROLE, MARKETER_ROLE } from "../utils/roles";
import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  UserIcon,
  ListIcon,
  PlusIcon,
  DollarLineIcon,
  ArrowUpIcon,
  PieChartIcon,
  GroupIcon,
} from "../icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    roles?: string[];
  }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const userRole = user?.role || "Guest";
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      path: "/",
    },
    {
      icon: <GroupIcon />,
      name: "Users",
      subItems: [
        { name: "All Users", path: "/users", roles: [ADMIN_ROLE] },
        { name: "Admin", path: "/admin", roles: [ADMIN_ROLE] },
        {
          name: "Marketers",
          path: "/marketers",
          roles: [ADMIN_ROLE, MARKETER_ROLE],
        },
        {
          name: "Agents",
          path: "/agents",
          roles: ["Guest", ADMIN_ROLE],
        },
        {
          name: "My Agents",
          path: "/myagents",
          roles: [MARKETER_ROLE],
        },
        {
          name: "Riders",
          path: "/riders",
          roles: [ADMIN_ROLE, ACCOUNTANT_ROLE],
        },
        {
          name: "Accountants",
          path: "/accountants",
          roles: [ADMIN_ROLE, ACCOUNTANT_ROLE],
        },
        {
          name: "Register Agents",
          path: `/onboardagent/${user?.referral_code}`,
          roles: [MARKETER_ROLE, ADMIN_ROLE],
        },
      ],
    },
    {
      icon: <UserIcon />,
      name: "Edit Profile",
      path: "/profile",
      roles: ["Guest", ADMIN_ROLE],
    },
    {
      icon: <PieChartIcon />,
      name: "Marketers Leaderboard",
      path: "/marketers-leaderboard",
    },
  ];

  const othersItems: NavItem[] = [
    {
      icon: <BoxCubeIcon />,
      name: "Recollections",
      path: "/recollections",
      roles: [ADMIN_ROLE, ACCOUNTANT_ROLE],
    },
    {
      icon: <DollarLineIcon />,
      name: "Disbursement",
      path: "/disbursement",
      roles: [ADMIN_ROLE, ACCOUNTANT_ROLE],
    },
    {
      icon: <PlusIcon />,
      name: "Deposit",
      path: "/deposit",
      roles: [ADMIN_ROLE, ACCOUNTANT_ROLE],
    },
    {
      icon: <ArrowUpIcon />,
      name: "Withdrawal",
      path: "/withdrawal",
      roles: [ADMIN_ROLE, ACCOUNTANT_ROLE],
    },
    {
      icon: <ListIcon />,
      name: "Transactions Log",
      path: "/transactions",
      roles: [ADMIN_ROLE, ACCOUNTANT_ROLE],
    },
    {
      icon: <ListIcon />,
      name: "Audit Log",
      path: "/audit",
      roles: [ADMIN_ROLE],
    },
  ];

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const filterItemsByRole = (items: NavItem[]) => {
    return items
      .filter((item) => !item.roles || item.roles.includes(userRole))
      .map((item) => {
        if (item.subItems) {
          // Filter subItems too
          const filteredSubItems = item.subItems.filter(
            (sub) => !sub.roles || sub.roles.includes(userRole)
          );
          return { ...item, subItems: filteredSubItems };
        }
        return item;
      });
  };

  const filteredNavItems = filterItemsByRole(navItems);
  const filteredOthersItems = filterItemsByRole(othersItems);

  const getFilteredSubItems = (
    subItems: NavItem["subItems"],
    role: string
  ): NavItem["subItems"] => {
    if (!subItems) return subItems;
    switch (role) {
      case "Admin":
        return subItems;
      case "Accountant":
        return subItems.filter((item) =>
          ["Accountants", "Riders", "Agents"].includes(item.name)
        );
      case "Marketer":
        return subItems.filter((item) =>
          ["Marketers", "My Agents", "Register Agents"].includes(item.name)
        );
      default:
        return;
    }
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const filteredSubItems =
          nav.name === "Users"
            ? getFilteredSubItems(nav.subItems, userRole)
            : nav.subItems;
        return (
          <li key={nav.name}>
            {filteredSubItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) &&
                  filteredSubItems.length > 0 && (
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {filteredSubItems &&
              (isExpanded || isHovered || isMobileOpen) &&
              filteredSubItems.length > 0 && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {filteredSubItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
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
                                } menu-dropdown-badge`}
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
                                } menu-dropdown-badge`}
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
        className={`py-8 flex max-lg:hidden ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center justify-start gap-2">
              <img
                className=""
                src="/images/logo/safulpay-icon-green.svg"
                alt="Logo"
                width={22}
                height={22}
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#3a5646] to-[#c3f02c] bg-clip-text text-transparent">
                SafulPay
              </span>
            </div>
          ) : (
            <img
              className=""
              src="/images/logo/safulpay-icon-green.svg"
              alt="Logo"
              width={22}
              height={22}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar max-lg:mt-8">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
            {filteredOthersItems.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Finance and Logs"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(filteredOthersItems, "others")}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
