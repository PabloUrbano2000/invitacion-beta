import React, { useContext, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { useParams } from "react-router";
import { FirebaseContext } from "../../firebase";
import Spinner from "../ui/Spinner";
import { namesExtendRegex } from "../../utils/regex";
import { Family, Invitation } from "../../types";

const InvitationPage = () => {
  const { id } = useParams();
  const { firebase } = useContext(FirebaseContext);
  const [message, setMessage] = React.useState("");

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
          const invitationFound: Invitation | null | undefined =
            await firebase?.getOneDocument("invitations", [
              ["family", "==", familyInstance],
            ]);
          if (invitationFound) {
            setMessage(
              `Parece que ya confirmaste tu ${
                invitationFound.accepted === 1 ? "asistencia" : "inasistencia"
              } :)`
            );
            changePage(6);
            return;
          }
          changePage(2);
          return;
        }
        setMessage("La invitación a caducado");
        changePage(6);
      };
      checkInvitationByFamilyId();
    }
  }, []);

  const changePage = (page: 1 | 2 | 3 | 4 | 5 | 6) => {
    setStepByStep(page);
  };
  const updateMessage = (message: string) => {
    setMessage(message);
  };

  return (
    <InvitationLayout>
      {stepByStep === 1 && <Step1></Step1>}
      {stepByStep === 2 && <Step2 changePage={changePage}></Step2>}
      {stepByStep === 3 && <Step3 changePage={changePage}></Step3>}
      {stepByStep === 4 && (
        <Step4
          id={id || ""}
          changePage={changePage}
          updateMessage={updateMessage}
        ></Step4>
      )}
      {stepByStep === 5 && (
        <Step5
          id={id || ""}
          changePage={changePage}
          updateMessage={updateMessage}
        ></Step5>
      )}
      {stepByStep === 6 && <Step6 message={message}></Step6>}
    </InvitationLayout>
  );
};

const InvitationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="flex m-auto items-center flex-col justify-center content-center min-h-screen"
      style={{
        background: "#0f0e1a",
      }}
    >
      <div className="invitation-container">{children}</div>
    </div>
  );
};

const Step1 = () => (
  <div>
    <Spinner className="lds-dual-ring-white"></Spinner>
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

const Step3 = ({ changePage }: { changePage: Function }) => (
  <div className="flex h-full flex-col">
    <div className="w-full p-2">
      <p>
        Confirmar asistencia:{" "}
        <button className="rounded" onClick={() => changePage(4)}>
          SI
        </button>{" "}
        <button className="rounded" onClick={() => changePage(5)}>
          NO
        </button>
      </p>
    </div>
  </div>
);

const Step4 = ({
  id,
  changePage,
  updateMessage,
}: {
  id: string;
  changePage: Function;
  updateMessage: Function;
}) => {
  const { firebase } = useContext(FirebaseContext);
  const [inProcess, setInProcess] = React.useState(false);
  const [isConfirm, setIsConfirm] = React.useState(false);
  const [asistants, setAsistants] = React.useState("");

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
        const familyFound: Family | null | undefined =
          await firebase?.getDocumentById("families", id);

        if (!familyFound) {
          updateMessage("Su invitación ya caducó");
          changePage(6);
          return;
        }
        const familyInstance = firebase?.instanceReferenceById("families", id);
        const invitationFound: Invitation | null | undefined =
          await firebase?.getOneDocument("invitations", [
            ["family", "==", familyInstance],
          ]);
        if (invitationFound) {
          updateMessage(
            `Parece que ya confirmaste tu ${
              invitationFound.accepted === 1 ? "asistencia" : "inasistencia"
            }`
          );
          changePage(6);
          return;
        }
        const data = await firebase?.insertDocument("invitations", {
          family: familyInstance,
          family_name: familyFound.name,
          father_name: values.father_name,
          mother_name: values.mother_name,
          first_child_name: values.first_child_name,
          second_child_name: values.second_child_name,
          accepted: 1,
        });

        if (data?.id) {
          let names = "";
          if (values.father_name) names = values.father_name;
          if (values.mother_name)
            names += values.father_name
              ? ", " + values.mother_name
              : values.mother_name;
          if (values.first_child_name) names += ", " + values.first_child_name;
          if (values.second_child_name)
            names += ", " + values.second_child_name;
          const lastIndex = names.lastIndexOf(",");
          if (lastIndex !== -1) {
            let namesArray = names.split("");
            namesArray[lastIndex] = " y";
            names = namesArray.join("");
          }
          setAsistants(names);
          setIsConfirm(true);
        } else {
          changePage(6);
          updateMessage("Ocurrió un error desconocido");
        }
      } catch (error) {
        changePage(6);
        updateMessage("Ocurrió un error desconocido");
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
      {isConfirm ? (
        <>
          <p
            className="flex flex-col text-xl mb-4 text-center font-semibold uppercase my-2"
            style={{
              color: "#0e7b24",
              padding: "20px 40px",
            }}
          >
            {asistants}
          </p>
          <p
            className="flex flex-col text-xl mb-4 text-center font-semibold uppercase my-2"
            style={{
              color: "#0e7b24",
              padding: "20px 40px",
            }}
          >
            ¡Estamos contando los días para poder compartir con ustedes este
            momento mágico!
          </p>
        </>
      ) : (
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
                  formik.errors.first_child_name &&
                  "border-red-500 text-red-700"
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
                  formik.errors.second_child_name &&
                  "border-red-500 text-red-700"
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
              className="bg-green-200 border-cyan-100 text-xl p-3 rounded disabled:bg-green-100"
              value="Enviar Respuesta"
            />
          </form>
        </div>
      )}
    </div>
  );
};

const Step5 = ({
  id,
  changePage,
  updateMessage,
}: {
  id: string;
  changePage: Function;
  updateMessage: Function;
}) => {
  const { firebase } = useContext(FirebaseContext);
  const [inProcess, setInProcess] = React.useState(false);
  const [isConfirm, setIsConfirm] = React.useState(false);

  // validacion y leer los datos del formulario
  const formik = useFormik({
    initialValues: {
      canceler: "",
    },
    validationSchema: Yup.object({
      canceler: Yup.string()
        .required()
        .matches(namesExtendRegex, "Formato inválido"),
    }),
    onSubmit: async (values) => {
      try {
        setInProcess(true);
        const familyFound: Family | null | undefined =
          await firebase?.getDocumentById("families", id);

        if (!familyFound) {
          updateMessage("Su invitación ya caducó");
          changePage(6);
          return;
        }
        const familyInstance = firebase?.instanceReferenceById("families", id);
        const invitationFound: Invitation | null | undefined =
          await firebase?.getOneDocument("invitations", [
            ["family", "==", familyInstance],
          ]);
        if (invitationFound) {
          updateMessage(
            `Parece que ya confirmaste tu ${
              invitationFound.accepted === 1 ? "asistencia" : "inasistencia"
            }`
          );
          changePage(6);
          return;
        }
        const data = await firebase?.insertDocument("invitations", {
          family: familyInstance,
          family_name: familyFound.name,
          canceller: values.canceler,
          accepted: 0,
        });

        if (data?.id) {
          setIsConfirm(true);
        } else {
          changePage(6);
          updateMessage("Ocurrió un error desconocido");
        }
      } catch (error) {
        changePage(6);
        updateMessage("Ocurrió un error desconocido");
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
      {isConfirm ? (
        <p>
          ¡{formik.values.canceler}, gracias por tomarte el tiempo en responder!
        </p>
      ) : (
        <div className="w-full flex flex-col p-3">
          <form onSubmit={formik.handleSubmit} className="flex flex-col w-full">
            <p className="text-green-600 p-2 font-bold">
              ¿Estás seguro que no asistirás? Por favor ingresa tu nombre para
              no tomarte en cuenta
            </p>
            <div className="mb-4">
              <input
                id="canceler"
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  formik.errors.canceler && "border-red-500 text-red-700"
                }`}
                type="text"
                placeholder="Nombre"
                value={formik.values.canceler}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <input
              type={"submit"}
              disabled={inProcess}
              className="bg-green-200 border-cyan-100 text-xl p-3 rounded disabled:bg-green-100"
              value="Enviar Respuesta"
            />
          </form>
        </div>
      )}
    </div>
  );
};

const Step6 = ({ message }: { message: string }) => (
  <div className="my-auto flex flex-col">
    <h3
      className="flex flex-col text-2xl mb-4 text-center font-semibold uppercase my-2"
      style={{
        color: "#0e7b24",
        padding: "20px 40px",
      }}
    >
      {message}
    </h3>
  </div>
);

export default InvitationPage;
