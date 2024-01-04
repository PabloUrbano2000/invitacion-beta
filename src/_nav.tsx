type NavRouter = {
  name: string;
  to?: string;
  icon?: React.Component;
  component?: React.LazyExoticComponent<React.ComponentType<any>>;
  items?: NavRouter[];
};

const NavRoutes = (): (NavRouter | undefined)[] => {
  const routes: (NavRouter | undefined)[] = [
    {
      name: "Escritorio",
      to: "/dashboard",
    },
    {
      name: "Familias",
      to: "/familias",
    },
  ];

  const cleanRoutes = routes.filter((route) => route !== undefined);

  return cleanRoutes;
};

export default NavRoutes;
