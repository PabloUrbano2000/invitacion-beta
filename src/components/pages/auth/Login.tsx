import React, { useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { useNavigate } from "react-router";
import { useAuthContext } from "../../../context/AuthContext";
import { setCookie } from "../../../utils/cookies";
import { COOKIE_TOKEN } from "../../../utils/constants";
import { showFailToast, showSuccessToast } from "../../../utils/toast";
import { FirebaseContext } from "../../../firebase";
import { generateRandom } from "../../../utils/randoms";

const LoginPage = () => {
  const navigate = useNavigate();
  const { updateAuth } = useAuthContext();
  const { firebase } = useContext(FirebaseContext);
  const [inProcess, setInProcess] = React.useState(false);

  // validacion y leer los datos del formulario
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Formato de correo inválido")
        .required("El correo es obligatorio"),
      password: Yup.string().required("La contraseña es obligatoria"),
    }),
    onSubmit: async (values) => {
      try {
        setInProcess(true);

        const data = await firebase?.getOneDocument("users", [
          ["email", "==", values.email],
          ["password", "==", values.password],
        ]);

        console.log(data);

        if (data) {
          const { id, ...res } = data;
          const token = generateRandom(20);
          firebase?.updateDocumentById("users", data.id, { ...res, token });
          showSuccessToast("Inicio de sesión éxitoso");

          setCookie(COOKIE_TOKEN, token || "");

          updateAuth({ user: data });
          navigate("/dashboard", { replace: true });
        } else {
          showFailToast("Correo y/o contraseña inválido");
        }
      } catch (error) {
        showFailToast("Ocurrió un error desconocido");
      } finally {
        setInProcess(false);
      }
    },
  });

  return (
    <>
      <div
        className="flex justify-center w-11/12 rounded flex-col bg-slate-100 md:w-6/12 p-5 my-5"
        style={{
          maxWidth: "500px",
        }}
      >
        <h1 className="text-3xl mb-4 text-center font-semibold uppercase my-2">
          Inicio de sesión
        </h1>
        <div className="w-full flex flex-col p-3">
          <form onSubmit={formik.handleSubmit} className="flex flex-col w-full">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="email"
                placeholder="Correo electrónico"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.email && formik.errors.email ? (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5"
                role={"alert"}
              >
                <p className="font-bold">Hubo un error:</p>
                <p className="">{formik?.errors?.email}</p>
              </div>
            ) : null}

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                id="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="password"
                placeholder="Contraseña"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5"
                role={"alert"}
              >
                <p className="font-bold">Hubo un error:</p>
                <p className="">{formik.errors.password}</p>
              </div>
            ) : null}
            <input
              type={"submit"}
              disabled={inProcess}
              className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-600 w-full mt-5 p-2 text-white uppercase font-bold cursor-pointer"
              value="Iniciar Sesión"
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
