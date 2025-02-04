import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div
      className="flex m-auto items-center flex-col justify-center content-center min-h-screen"
      style={{
        background: "#fef7f9",
      }}
    >
      <Outlet />
    </div>
  );
};

export default AuthLayout;
