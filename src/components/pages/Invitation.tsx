import React, { useContext, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { useParams } from "react-router";
import { FirebaseContext } from "../../firebase";
import Spinner from "../ui/Spinner";
import { namesRegex } from "../../utils/regex";
import { Family, Invitation } from "../../types";
import MagicHatImage from "../../assets/sombrero-magico.png";
import HouseImage from "../../assets/fecha-nueva-hora.png";
import VaritaImage from "../../assets/varita2.png";
import VenAMiImage from "../../assets/ven-a-celebrar.png";

const formatNames = ({
  mother_name,
  father_name,
  first_child_name,
  second_child_name,
}: {
  mother_name: string;
  father_name: string;
  first_child_name: string;
  second_child_name: string;
}) => {
  let names = "";
  if (mother_name) names = mother_name.split(" ")[0];
  if (father_name)
    names += mother_name
      ? ", " + father_name.split(" ")[0]
      : father_name.split(" ")[0];
  if (first_child_name) names += ", " + first_child_name.split(" ")[0];
  if (second_child_name) names += ", " + second_child_name.split(" ")[0];
  const lastIndex = names.lastIndexOf(",");
  if (lastIndex !== -1) {
    let namesArray = names.split("");
    namesArray[lastIndex] = " y";
    names = namesArray.join("");
  }
  return names;
};

const InvitationPage = () => {
  const { id } = useParams();
  const { firebase } = useContext(FirebaseContext);
  const [names, setNames] = React.useState("");

  /*
   * 1: loading
   * 2: mostrar invitacion
   * 3: selección
   * 4: formulario de confirmación
   * 5: formulario de negación
   * 6: mensaje final de confirmación
   * 7: mensaje final de negación
   * 8: mensaje de error
   */
  const [stepByStep, setStepByStep] = React.useState<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  >(1);

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
            if (invitationFound.accepted === 1) {
              setNames(
                formatNames({
                  mother_name: invitationFound.mother_name || "",
                  father_name: invitationFound.father_name || "",
                  first_child_name: invitationFound.first_child_name || "",
                  second_child_name: invitationFound.second_child_name || "",
                })
              );
              changePage(6);
            } else {
              setNames(invitationFound.canceller || "");
              changePage(7);
            }
            return;
          }
          changePage(2);
          return;
        }
        changePage(8);
      };
      checkInvitationByFamilyId();
    }
  }, []);

  const changePage = (page: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) => {
    setStepByStep(page);
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
          updateNames={setNames}
        ></Step4>
      )}
      {stepByStep === 5 && (
        <Step5
          id={id || ""}
          changePage={changePage}
          updateNames={setNames}
        ></Step5>
      )}
      {stepByStep === 6 && <Step6 names={names}></Step6>}
      {stepByStep === 7 && <Step7 names={names}></Step7>}
      {stepByStep === 8 && <Step8></Step8>}
    </InvitationLayout>
  );
};

const InvitationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="flex m-auto flex-col min-h-screen"
      style={{
        backgroundColor: "#d7ecf6",
      }}
    >
      <div className="invitation-container">
        <div className="destello destello-top-left" />
        <div className="destello destello-top-right" />
        <div className="destello destello-bottom-left" />
        <div className="destello destello-bottom-right" />
        <div className="invitation-content">{children}</div>
      </div>
    </div>
  );
};

const Step1 = () => (
  <div className="flex m-auto flex-col justify-center content-center">
    <Spinner className="lds-dual-ring-white"></Spinner>
  </div>
);

const Step2 = ({ changePage }: { changePage: Function }) => (
  <div>
    <img className="invitation-header" src={VenAMiImage} />
    <div className="invitation-subheader">
      <p>
        cumpleaños
        <br />
        Mágico
      </p>
    </div>
    <div className="m-auto">
      <img src={MagicHatImage} alt="magic hat" className="invitation-hat" />
    </div>
    <div className="invitation-description">
      <p>Mi primer añito</p>
    </div>
    <div className="invitation-subdescription">
      <p>ian salvador</p>
    </div>
    <div className="invitation-house">
      <img src={HouseImage} className="invitation-house" />
    </div>

    <p className="invitation-house-direction">San Juan de Miraflores</p>

    <button className="invitation-button" onClick={() => changePage(3)}>
      Responder invitación
    </button>
  </div>
);

const FormContainer = ({
  changePage,
  children = <></>,
  disableConfirm = false,
  disableDenied = false,
}: {
  children?: React.ReactNode;
  disableConfirm?: boolean;
  disableDenied?: boolean;
  changePage: Function;
}) => (
  <>
    <p className="invitation-form-title">Mi primer añito</p>
    <p className="invitation-form-subtitle">ian salvador</p>
    <div className="w-full p-2">
      <p className="invitation-form-header">
        ¿Asistirás a mi fiesta mágica?
        <img
          src={VaritaImage}
          className="invitation-form-image"
          alt="varita mágica"
        />
      </p>
      <div className="flex justify-center items-center">
        <label
          htmlFor="confirm-button"
          className={`invitation-form-btn-container ${
            disableConfirm ? "disable" : ""
          }`}
        >
          <button
            id="confirm-button"
            className={`invitation-form-btn confirm-button`}
            onClick={() => changePage(4)}
          ></button>
          <span>Sí, ahi estaré!</span>
        </label>
        <label
          htmlFor="denied-button"
          className={`invitation-form-btn-container ${
            disableDenied ? "disable" : ""
          }`}
        >
          <button
            id="denied-button"
            className="invitation-form-btn denied-button"
            onClick={() => changePage(5)}
          />
          <span>Lo siento, no podré</span>
        </label>
      </div>
    </div>
    {children}
  </>
);

const Step3 = ({ changePage }: { changePage: Function }) => (
  <div>
    <FormContainer changePage={changePage} />
  </div>
);

const Step4 = ({
  id,
  changePage,
  updateNames,
}: {
  id: string;
  changePage: Function;
  updateNames: Function;
}) => {
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
        .matches(namesRegex, "Formato inválido"),
      mother_name: Yup.string()
        .required()
        .matches(namesRegex, "Formato inválido"),
      first_child_name: Yup.string()
        .optional()
        .matches(namesRegex, "Formato inválido"),
      second_child_name: Yup.string()
        .optional()
        .matches(namesRegex, "Formato inválido"),
    }).shape(
      {
        father_name: Yup.string().when(["mother_name"], ([mother_name]) => {
          if (mother_name === undefined || mother_name?.length === 0) {
            return Yup.string()
              .required("Es requerido")
              .matches(namesRegex, "Formato inválido");
          }
          return Yup.string()
            .optional()
            .matches(namesRegex, "Formato inválido");
        }),
        mother_name: Yup.string().when(["father_name"], ([father_name]) => {
          if (father_name === undefined || father_name?.length === 0) {
            return Yup.string()
              .required("Es requerido")
              .matches(namesRegex, "Formato inválido");
          }
          return Yup.string()
            .optional()
            .matches(namesRegex, "Formato inválido");
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
          changePage(8);
          return;
        }
        const familyInstance = firebase?.instanceReferenceById("families", id);
        const invitationFound: Invitation | null | undefined =
          await firebase?.getOneDocument("invitations", [
            ["family", "==", familyInstance],
          ]);
        if (invitationFound) {
          changePage(8);
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
          const asistants = formatNames({
            mother_name: values.mother_name,
            father_name: values.father_name,
            first_child_name: values.first_child_name,
            second_child_name: values.second_child_name,
          });
          updateNames(asistants);
          changePage(6);
        } else {
          changePage(8);
        }
      } catch (error) {
        changePage(8);
      } finally {
        setInProcess(false);
      }
    },
  });

  return (
    <div className="w-full">
      <FormContainer changePage={changePage} disableDenied={true}>
        <div className="w-full mx-auto flex flex-col p-3">
          <form
            onSubmit={formik.handleSubmit}
            className="container px-3 mx-auto md:px-5"
          >
            <p className="form-confirm-title">
              Por favor ingresa tu nombre y el de las personas con las que irás:
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr",
                gap: 20,
              }}
            >
              <div className="mb-4 w-full">
                <input
                  id="mother_name"
                  className={`shadow appearance-none w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formik.errors.mother_name &&
                    "border-red-500 text-red-700 error-effect"
                  }`}
                  type="text"
                  placeholder="Mamá"
                  value={formik.values.mother_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={50}
                />
              </div>
              <div className="mb-4 w-full">
                <input
                  id="father_name"
                  className={`shadow appearance-none border w-full rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formik.errors.father_name &&
                    "border-red-500 text-red-700 error-effect"
                  }`}
                  type="text"
                  placeholder="Papá"
                  value={formik.values.father_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={50}
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr",
                gap: 20,
              }}
            >
              <div className="mb-4 w-full">
                <input
                  id="first_child_name"
                  className={`shadow appearance-none w-full border normal-effect rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formik.errors.first_child_name &&
                    "border-red-500 text-red-700 error-effect"
                  }`}
                  type="text"
                  placeholder="Hijo (a)"
                  value={formik.values.first_child_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={50}
                />
              </div>

              <div className="mb-4 w-full">
                <input
                  id="second_child_name"
                  className={`shadow appearance-none w-full border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formik.errors.second_child_name &&
                    "border-red-500 text-red-700 error-effect"
                  }`}
                  type="text"
                  placeholder="Hijo (a)"
                  value={formik.values.second_child_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={50}
                />
              </div>
            </div>
            <input
              type={"submit"}
              disabled={inProcess || !formik.isValid}
              style={{
                marginTop: 42,
              }}
              className="invitation-button"
              value="Enviar respuesta"
            />
          </form>
        </div>
      </FormContainer>
    </div>
  );
};

const Step5 = ({
  id,
  changePage,
  updateNames,
}: {
  id: string;
  changePage: Function;
  updateNames: Function;
}) => {
  const { firebase } = useContext(FirebaseContext);
  const [inProcess, setInProcess] = React.useState(false);

  // validacion y leer los datos del formulario
  const formik = useFormik({
    initialValues: {
      canceler: "",
    },
    validationSchema: Yup.object({
      canceler: Yup.string().required().matches(namesRegex, "Formato inválido"),
    }),
    onSubmit: async (values) => {
      try {
        setInProcess(true);
        const familyFound: Family | null | undefined =
          await firebase?.getDocumentById("families", id);

        if (!familyFound) {
          changePage(8);
          return;
        }
        const familyInstance = firebase?.instanceReferenceById("families", id);
        const invitationFound: Invitation | null | undefined =
          await firebase?.getOneDocument("invitations", [
            ["family", "==", familyInstance],
          ]);
        if (invitationFound) {
          changePage(8);
          return;
        }
        const data = await firebase?.insertDocument("invitations", {
          family: familyInstance,
          family_name: familyFound.name,
          canceller: values.canceler,
          accepted: 0,
        });

        if (data?.id) {
          updateNames(values.canceler.split(" ")[0]);
          changePage(7);
        } else {
          changePage(8);
        }
      } catch (error) {
        changePage(8);
      } finally {
        setInProcess(false);
      }
    },
  });
  return (
    <div>
      <FormContainer changePage={changePage} disableConfirm={true}>
        <div className="w-full mx-auto flex flex-col p-3">
          <form
            onSubmit={formik.handleSubmit}
            className="container px-3 mx-auto md:px-5"
          >
            <p className="form-denied-title">
              ¿Seguro que no podrás asistir?
              <br />
              Por favor ingresa tu nombre,
              <br />
              asi podremos guardar tus
              <br />
              dulces
            </p>
            <div className="mb-4 mx-auto">
              <input
                id="canceler"
                className={`shadow flex appearance-none mx-auto border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                  formik.errors.canceler &&
                  "border-red-500 text-red-700 error-effect"
                }`}
                style={{
                  maxWidth: 150,
                }}
                type="text"
                placeholder="Nombre"
                value={formik.values.canceler}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>

            <input
              type={"submit"}
              disabled={inProcess || !formik.isValid}
              className="invitation-button"
              value="Enviar respuesta"
              style={{
                marginTop: 90,
              }}
            />
          </form>
        </div>
      </FormContainer>
    </div>
  );
};

const Step6 = ({ names }: { names: string }) => (
  <div className="h-full flex flex-col">
    <div className="invitation-response">
      <img
        className="invitation-final-image"
        src={VaritaImage}
        alt="varita mágica"
      />
      <p
        className="invitation-final-message"
        style={{
          marginTop: 10,
          marginBottom: 20,
        }}
      >
        Gracias, ¡mis papis y yo
        <br />
        estamos contando los días
        <br />
        para poder compartir con
        <br />
        ustedes este momento mágico!
      </p>
      <p
        className="invitation-final-message"
        style={{
          marginBottom: 20,
        }}
      >
        Nos vemos muy pronto {names}
      </p>

      <div className="invitation-house" style={{ marginBottom: 0 }}>
        <img
          src={HouseImage}
          className="invitation-house"
          style={{
            width: 300,
          }}
        />
      </div>

      <p
        className="invitation-house-direction"
        style={{
          marginTop: 10,
        }}
      >
        Jr. Jose Morales 917 - SJM
      </p>

      <p
        className="invitation-final-message"
        style={{
          marginBottom: 20,
        }}
      >
        Puedes ubicar la dirección en el
        <br />
        mapa aquí:{" "}
        <a
          target="_blank"
          href="https://www.google.com/maps/place/Jr.+Jose+A.+Morales+917,+Lima+15801/@-12.1588896,-76.9716376,17z/data=!4m6!3m5!1s0x9105b8598cbe5a23:0x145ff1188cabb9de!8m2!3d-12.1594979!4d-76.9696313!16s%2Fg%2F11cs6vyc7w?entry=ttu"
          style={{
            textDecoration: "underline",
            color: "#2121ff",
          }}
        >
          R2RJ+64
        </a>
      </p>
    </div>
    <p className="invitation-final-text">ian salvador</p>
  </div>
);

const Step7 = ({ names }: { names: string }) => (
  <div className="h-full flex flex-col">
    <div className="invitation-response">
      <img
        className="invitation-final-image"
        src={VaritaImage}
        alt="varita mágica"
        style={{
          marginTop: 30,
        }}
      />
      <p
        className="invitation-final-message"
        style={{
          marginTop: 10,
          marginBottom: 20,
        }}
      >
        ¡{names}, nos apena que no
        <br />
        puedas asistir...
      </p>
      <p className="invitation-final-message">
        Gracias por tomarte el tiempo
        <br />
        en responder!
      </p>
    </div>
    <p className="invitation-final-text">ian salvador</p>
  </div>
);

const Step8 = () => (
  <div className="h-full flex flex-col">
    <div className="invitation-response">
      <img
        className="invitation-final-image"
        src={VaritaImage}
        alt="varita mágica"
      />
      <p className="invitation-final-message">
        Algo salió mal
        <br />
        inténtalo más tarde
      </p>
    </div>
    <p className="invitation-final-text">ian salvador</p>
  </div>
);

export default InvitationPage;
