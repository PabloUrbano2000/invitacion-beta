import { useState, useEffect, useContext } from "react";
import Excel from "exceljs";
import { saveAs } from "file-saver";
import { FirebaseContext } from "../../firebase";
import { generateLastPath } from "../../utils/session";
import { Family } from "../../types";
import Spinner from "../ui/Spinner";
import { showFailToast, showSuccessToast } from "../../utils/toast";
import FormModal from "../ui/FormModal";
import AlertModal from "../ui/AlertModal";

const FamiliesPage = () => {
  const { firebase } = useContext(FirebaseContext);
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);

  const [inProcess, setInProcess] = useState(false);

  const [familyName, setFamilyName] = useState("");
  const [savingExcel, setSavingExcel] = useState(false);

  const workbook = new Excel.Workbook();

  useEffect(() => {
    generateLastPath();

    try {
      setIsLoading(true);

      firebase?.getDocumentsRealtime(
        "families",
        (data: any) => {
          setFamilies(data);
          setIsLoading(false);
        },
        ["name", "asc"]
      );
    } catch (error) {
      showFailToast("Ocurrió un error al cargar las familias");
    }
  }, []);

  const handleRegisterFamily = async () => {
    try {
      setInProcess(true);
      const verifyFamily = await firebase?.getOneDocument("families", [
        ["name", "==", familyName.trim()],
      ]);
      if (verifyFamily) {
        showFailToast(
          `La familia ${familyName.trim()} ya se encuentra registrada`
        );
        setInProcess(false);
      } else {
        const result = await firebase?.insertDocument("families", {
          name: familyName.trim(),
        });
        if (result?.id) {
          setShowRegisterModal(false);
          setFamilyName("");
          showSuccessToast("Familia registrada éxitosamente");
        } else {
          showFailToast("Ocurrió un error al registrar a la familia");
        }
      }
    } catch (error) {
      showFailToast("Ocurrió un error al registrar a la familia");
    } finally {
      setInProcess(false);
    }
  };

  const handleDeleteFamily = async () => {
    try {
      setInProcess(true);
      await firebase?.deleteDocumentById("families", selectedFamily?.id || "");
      showSuccessToast(`Familia eliminada éxitosamente`);
      setInProcess(false);
      setShowDeleteModal(false);
    } catch (error) {
      showFailToast("Ocurrió un error al eliminar a la familia");
    } finally {
      setInProcess(false);
    }
  };

  const handleExport = async () => {
    const fileName = "families - data";
    try {
      setSavingExcel(true);
      let dataRowX: Family[] = [];
      const res = await firebase?.getAllDocuments("families", [
        ["name", "asc"],
      ]);
      res?.docs.forEach((data: Family) => {
        const ax: Family = {};
        ax.id = data.id;
        ax.name = data.name || "";
        dataRowX.push(ax);
      });
      const worksheet = workbook.addWorksheet(fileName);
      const columns = [
        { header: "ID", key: "id" },
        { header: "Nombre", key: "name" },
      ];
      worksheet.columns = columns;
      worksheet.getRow(1).font = { bold: true };
      worksheet.columns.forEach((column) => {
        column.width = 18;
        column.alignment = { horizontal: "center" };
      });
      dataRowX.forEach((singleData) => {
        worksheet.addRow(singleData);
      });
      worksheet.eachRow({ includeEmpty: false }, (row: any) => {
        const currentCell = row._cells;
        currentCell.forEach((singleCell: any) => {
          const cellAddress = singleCell._address;
          worksheet.getCell(cellAddress).border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });
      const buf = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buf]), `${fileName}.xlsx`);
      setSavingExcel(false);
    } catch (error) {
      showFailToast("Sucedió un error al descargar el excel");
    } finally {
      setSavingExcel(false);
      workbook.removeWorksheet(fileName);
    }
  };

  return (
    <>
      <div className="flex flex-col container px-1 md:px-2 xl:px-4 mx-auto">
        <div className="flex flex-col md:flex-row container mx-auto">
          <h1 className="text-center my-1 md:text-left font-bold text-lg">
            Familias
          </h1>
          <button
            disabled={savingExcel}
            className="w-full md:w-auto my-1 text-center ml-auto rounded bg-slate-900 py-2 px-4 text-lg text-white text-normal font-bold"
            onClick={() => handleExport()}
          >
            Descargar
          </button>
          <button
            className="w-full md:w-auto my-1 text-center ml-auto rounded bg-slate-900 py-2 px-4 text-lg text-white text-normal font-bold"
            onClick={() => setShowRegisterModal(true)}
          >
            Nueva Familia
          </button>
        </div>
        <div className="flex flex-col my-3">
          <p className="font-bold">Familias registradas:</p>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              {families.length === 0 ? (
                <p className="text-sm text-normal">
                  Por el momento no hay familias registradas
                </p>
              ) : (
                <div className="w-full overflow-auto">
                  <table
                    className="table-auto bg-white mt-2 w-full"
                    style={{
                      border: "1px solid #000000",
                      minWidth: 400,
                    }}
                  >
                    <thead className="bg-black text-white">
                      <tr
                        style={{
                          minWidth: 150,
                        }}
                      >
                        <th
                          style={{
                            padding: "0.5rem",
                          }}
                        >
                          Nro.
                        </th>
                        <th
                          style={{
                            padding: "0.5rem",
                          }}
                        >
                          ID
                        </th>
                        <th
                          style={{
                            minWidth: 150,
                            padding: "0.5rem",
                          }}
                        >
                          Nombre Familia
                        </th>
                        <th
                          colSpan={1}
                          style={{
                            minWidth: 150,
                            padding: "0.5rem",
                          }}
                        >
                          Opciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {families.map((fam, index) => (
                        <tr key={fam.id} className="h-14">
                          <td
                            className="text-center"
                            style={{
                              padding: "0.5rem",
                            }}
                          >
                            {index + 1}
                          </td>
                          <td
                            className="text-center"
                            style={{
                              padding: "0.5rem",
                            }}
                          >
                            {fam.id}
                          </td>
                          <td
                            className="text-center"
                            style={{
                              padding: "0.5rem",
                            }}
                          >
                            {fam.name}
                          </td>
                          <td>
                            <button
                              className="flex flex-col mx-auto w-24 text-center items-center ml-auto rounded bg-red-600 py-1 px-2 text-lg text-white text-normal font-bold"
                              onClick={() => {
                                setShowDeleteModal(true);
                                setSelectedFamily(fam);
                              }}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <FormModal
        showModal={showRegisterModal}
        offModal={() => {
          setShowRegisterModal(false);
          setFamilyName("");
        }}
        onModal={() => setShowRegisterModal(true)}
        title="Registrar familia"
        hasValidValues={familyName.length > 0}
        inProcess={inProcess}
        onSuccess={handleRegisterFamily}
        closeButton="Cancelar"
        successButton="Registrar"
      >
        <form className="w-full">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="familyName"
          >
            Nombre de familia
          </label>
          <input
            id="familyName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={familyName}
            onChange={(ev) => setFamilyName(ev.target.value.toUpperCase())}
          />
        </form>
      </FormModal>
      <AlertModal
        showModal={showDeleteModal}
        offModal={() => {
          setShowDeleteModal(false);
        }}
        onModal={() => setShowDeleteModal(true)}
        title="Eliminar familia"
        description="¿Estás seguro de querer eliminar esta familia?, este proceso es irreversible"
        disableButton={inProcess}
        onSuccess={handleDeleteFamily}
        isWarning
        closeButton="Cancelar"
        successButton="Eliminar"
      ></AlertModal>
    </>
  );
};

export default FamiliesPage;
