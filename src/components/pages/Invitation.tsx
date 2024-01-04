import React, { useContext, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { useParams } from "react-router";
import { showFailToast, showSuccessToast } from "../../utils/toast";
import { FirebaseContext } from "../../firebase";
import { generateRandom } from "../../utils/randoms";
import Spinner from "../ui/Spinner";
import { namesExtendRegex, namesRegex } from "../../utils/regex";

const InvitationPage = () => {
  const { id } = useParams();
  const { firebase } = useContext(FirebaseContext);
  const [messageError, setMessageError] = React.useState("");

  /*
   * 1: loading
   * 2: mostrar invitacion
   * 3: formulario de llenado
   * 4: formulario de negación
   * 5: mensaje final
   * 6: mensaje de error
   */
  const [stepByStep, setStepByStep] = React.useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  useEffect(() => {
    if (id) {
      const checkInvitationByFamilyId = async () => {
        const familyFound = await firebase?.getDocumentById("families", id);
        if (familyFound) {
          const familyInstance = firebase?.instanceReferenceById(
            "families",
            familyFound.id
          );
          const invitationFound = await firebase?.getOneDocument(
            "invitations",
            [["family", "==", familyInstance]]
          );
          if (invitationFound) {
            setMessageError("La invitación ya fue registrada :)");
            changePage(6);
          } else {
            changePage(2);
          }
        } else {
          setMessageError("La invitación a caducado");
          changePage(6);
        }
      };
      checkInvitationByFamilyId();
    }
  }, []);

  const changePage = (page: 1 | 2 | 3 | 4 | 5 | 6) => {
    setStepByStep(page);
  };

  return (
    <InvitationLayout>
      {stepByStep === 1 && <Step1></Step1>}
      {stepByStep === 2 && <Step2 changePage={changePage}></Step2>}
      {stepByStep === 6 && <Step6 message={messageError}></Step6>}
      {stepByStep === 3 && <Step3></Step3>}
    </InvitationLayout>
  );
};

const InvitationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="flex m-auto items-center flex-col justify-center content-center min-h-screen"
      style={{
        background: "#abd47b",
      }}
    >
      <div className="invitation-container">{children}</div>
    </div>
  );
};

const Step1 = () => (
  <div>
    <Spinner></Spinner>
  </div>
);

const Step2 = ({ changePage }: { changePage: Function }) => (
  <div className="h-full flex flex-col p-7 justify-end">
    <button
      className="bg-green-200 border-cyan-100 text-xl p-3  rounded"
      onClick={() => changePage(3)}
    >
      Responder invitación
    </button>
  </div>
);

const Step3 = () => {
  const { firebase } = useContext(FirebaseContext);
  const [inProcess, setInProcess] = React.useState(false);

  // validacion y leer los datos del formulario
  const formik = useFormik({
    initialValues: {
      father_name: "",
      mother_name: "",
      first_child_name: "",
      second_child_name: "",
    },
    validationSchema: Yup.object({
      father_name: Yup.string()
        .required()
        .matches(namesExtendRegex, "Formato inválido"),
      mother_name: Yup.string()
        .required()
        .matches(namesExtendRegex, "Formato inválido"),
      first_child_name: Yup.string()
        .optional()
        .matches(namesExtendRegex, "Formato inválido"),
      second_child_name: Yup.string()
        .optional()
        .matches(namesExtendRegex, "Formato inválido"),
    }).shape(
      {
        father_name: Yup.string().when(["mother_name"], ([mother_name]) => {
          if (mother_name === undefined || mother_name?.length === 0) {
            return Yup.string()
              .required("Es requerido")
              .matches(namesExtendRegex, "Formato inválido");
          }
          return Yup.string()
            .optional()
            .matches(namesExtendRegex, "Formato inválido");
        }),
        mother_name: Yup.string().when(["father_name"], ([father_name]) => {
          if (father_name === undefined || father_name?.length === 0) {
            return Yup.string()
              .required("Es requerido")
              .matches(namesExtendRegex, "Formato inválido");
          }
          return Yup.string()
            .optional()
            .matches(namesExtendRegex, "Formato inválido");
        }),
      },
      [["father_name", "mother_name"]]
    ),
    onSubmit: async (values) => {
      try {
        setInProcess(true);

        const data = await firebase?.getOneDocument("users", [
          ["email", "==", values.father_name],
          ["password", "==", values.mother_name],
        ]);

        if (data) {
          const { id, ...res } = data;
          const token = generateRandom(20);
          firebase?.updateDocumentById("users", data.id, { ...res, token });
          showSuccessToast("Inicio de sesión éxitoso");
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
    <div
      className="flex justify-center w-11/12 sm:w-6/12 rounded flex-col md:w-6/12 p-5 my-5"
      style={{
        maxWidth: "500px",
      }}
    >
      <div className="w-full flex flex-col p-3">
        <form onSubmit={formik.handleSubmit} className="flex flex-col w-full">
          <div className="mb-4">
            <input
              id="father_name"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                formik.errors.father_name && "border-red-500 text-red-700"
              }`}
              type="text"
              placeholder="Padre"
              value={formik.values.father_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          <div className="mb-4">
            <input
              id="mother_name"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                formik.errors.mother_name && "border-red-500 text-red-700"
              }`}
              type="text"
              placeholder="Madre"
              value={formik.values.mother_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div className="mb-4">
            <input
              id="first_child_name"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                formik.errors.first_child_name && "border-red-500 text-red-700"
              }`}
              type="text"
              placeholder="Hijo/a"
              value={formik.values.first_child_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div className="mb-4">
            <input
              id="second_child_name"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                formik.errors.second_child_name && "border-red-500 text-red-700"
              }`}
              type="text"
              placeholder="Hijo/a"
              value={formik.values.second_child_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <input
            type={"submit"}
            disabled={inProcess}
            className="bg-green-200 border-cyan-100 text-xl p-3 rounded"
            value="Enviar Respuesta"
          />
        </form>
      </div>
    </div>
  );
};

const Step6 = ({ message }: { message: string }) => (
  <div className="my-auto flex flex-col">
    <h3 className="text-2xl mb-4 text-center font-semibold uppercase my-2">
      {message}
    </h3>
  </div>
);

export default InvitationPage;
