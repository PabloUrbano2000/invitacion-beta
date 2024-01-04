import React from "react";
import { NavLink } from "react-router-dom";
import NavRoutes from "../../_nav";

interface SidebarProps {
  show: boolean;
  onShow: () => void;
}
const Sidebar = ({ show, onShow }: SidebarProps) => {
  const routes = NavRoutes();

  return (
    <div
      className={`${
        show ? "w-3/4 absolute" : "w-1/6"
      } sm:relative md:w-2/5 xl:w-1/5 bg-green-900 h-screen z-50`}
    >
      <div className="flex flex-col p-3">
        <button
          onClick={() => onShow()}
          className="ml-auto p-4 w-5 h-5 rounded md:hidden block flex-col items-center justify-center"
        >
          {show ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
                />
              </svg>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
                />
              </svg>
            </>
          )}
        </button>
      </div>
      <div className={`p-6 ${show ? "block" : "hidden"} md:block`}>
        <p className="uppercase text-white text-2xl tracking-wide text-center font-bold">
          InvitacionesAdmin
        </p>
        <p className="mt-3 text-gray-300">
          Administra tu invitaciones en las siguientes opciones:
        </p>
        <nav className="mt-10">
          {routes.map((router) => (
            <NavLink
              key={router?.name}
              className={({ isActive }) => {
                return `p-1 py-2 block hover:bg-green-100 hover:text-gray-500 ${
                  isActive ? "text-blue-50" : "text-gray-400"
                }`;
              }}
              to={router?.to || ""}
            >
              {router?.name || ""}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
