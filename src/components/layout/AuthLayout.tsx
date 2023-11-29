import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div
      className="flex m-auto items-center flex-col justify-center content-center min-h-screen"
      style={{
        background: "#0f2539",
      }}
    >
      <Outlet />
    </div>
  );
};

export default AuthLayout;
