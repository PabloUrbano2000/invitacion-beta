// import { Link } from "react-router-dom";

const ErrorPage404 = () => {
  return (
    <>
      <div
        className="flex justify-center w-11/12 rounded flex-col bg-slate-100 md:w-6/12 shadow-lg p-5 my-5"
        style={{
          maxWidth: "500px",
          minHeight: "200px",
        }}
      >
        <div>
          <h2 className="text-2xl mb-4 text-center font-semibold uppercase my-2">
            Página no encontrada
          </h2>
          {/* <Link
            to={"/auth/login"}
            replace
            className="text-center mx-auto block text-blue-950 text-sm hover:text-blue-800"
          >
            Regresar a la pantalla principal
          </Link> */}
        </div>
      </div>
    </>
  );
};

export default ErrorPage404;
