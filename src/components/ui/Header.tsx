import { useAuthContext } from "../../context/AuthContext";

const Header = () => {
  const { user, cleanAuth } = useAuthContext();

  const closeSession = () => {
    // logout();
    cleanAuth();
  };

  return (
    <header
      className="flex w-full gap-3 sticky top-0 z-10 px-6"
      style={{
        backgroundColor: "#181924",
        height: "10vh",
      }}
    >
      {/* <div className="hidden md:flex items-center flex-col justify-center">
        <p className="text-white text-center">
          <span className="hidden xl:inline font-semibold">Rol:</span>{" "}
          {user?.email}
        </p>
      </div> */}
      <div className="hidden md:flex items-center flex-col justify-center">
        <p className="text-white text-center">
          <span className="hidden xl:inline font-semibold">Usuario:</span>{" "}
          {user?.email}
        </p>
      </div>
      <div className="flex items-center flex-col justify-center ml-auto">
        {user ? (
          <button
            className="text-white font-medium p-2 rounded-md bg-sky-900 hover:bg-sky-950"
            onClick={closeSession}
          >
            Cerrar Sesión
          </button>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
