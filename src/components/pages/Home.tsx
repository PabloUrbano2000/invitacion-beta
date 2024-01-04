import { useState, useEffect, useContext } from "react";
import Excel from "exceljs";
import { saveAs } from "file-saver";
import { FirebaseContext } from "../../firebase";
import { generateLastPath } from "../../utils/session";
import { Invitation } from "../../types";
import Spinner from "../ui/Spinner";
import { showFailToast, showSuccessToast } from "../../utils/toast";
import AlertModal from "../ui/AlertModal";
import { useAuthContext } from "../../context/AuthContext";

const HomePage = () => {
  const { firebase } = useContext(FirebaseContext);
  const { user } = useAuthContext();

  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);

  const [inProcess, setInProcess] = useState(false);

  const [savingExcel, setSavingExcel] = useState(false);

  const workbook = new Excel.Workbook();

  useEffect(() => {
    if (user) {
      generateLastPath();

      try {
        setIsLoading(true);

        firebase?.getDocumentsRealtime(
          "invitations",
          (data: any) => {
            setInvitations(data);
            setIsLoading(false);
          },
          ["family_name", "asc"]
        );
      } catch (error) {
        showFailToast("Ocurrió un error al cargar las invitaciones");
      }
    }
  }, [user]);

  const handleDeleteInvitation = async () => {
    try {
      setInProcess(true);
      await firebase?.deleteDocumentById(
        "invitations",
        selectedInvitation?.id || ""
      );
      showSuccessToast(`Invitación eliminada éxitosamente`);
      setInProcess(false);
      setShowDeleteModal(false);
    } catch (error) {
      showFailToast("Ocurrió un error al eliminar a la familia");
    } finally {
      setInProcess(false);
    }
  };

  const handleExport = async () => {
    const fileName = "invitations - data";
    try {
      setSavingExcel(true);
      let dataRowX: Invitation[] = [];
      const res = await firebase?.getAllDocuments("invitations", [
        ["family_name", "asc"],
      ]);
      res?.docs.forEach((data: Invitation) => {
        const ax: Invitation = {};
        ax.id = data.id;
        ax.family_name = data.family_name || "";
        ax.father_name = data.father_name || "";
        ax.mother_name = data.mother_name || "";
        ax.first_child_name = data.first_child_name || "";
        ax.second_child_name = data.second_child_name || "";
        ax.canceller = data.canceller || "";
        ax.accepted = data.accepted || 0;
        dataRowX.push(ax);
      });
      const worksheet = workbook.addWorksheet(fileName);
      const columns = [
        { header: "ID", key: "id" },
        { header: "Nombre de familia", key: "family_name" },
        { header: "Padre", key: "father_name" },
        { header: "Madre", key: "mother_name" },
        { header: "Primer hijo/a", key: "first_child_name" },
        { header: "Segundo hijo/a", key: "second_child_name" },
        { header: "Cancelador", key: "canceller" },
        { header: "Aceptación", key: "accepted" },
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
            Invitaciones
          </h1>
          <button
            disabled={savingExcel}
            className="w-full md:w-auto my-1 text-center ml-auto rounded bg-slate-900 py-2 px-4 text-lg text-white text-normal font-bold"
            onClick={() => handleExport()}
          >
            Descargar
          </button>
        </div>
        <div className="flex flex-col my-3">
          <p className="font-bold">Invitaciones aceptadas y rechazadas:</p>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              {invitations.length === 0 ? (
                <p className="text-sm text-normal">
                  Por el momento no hay invitaciones registradas
                </p>
              ) : (
                <div className="w-full overflow-auto">
                  <table className="table-auto bg-white mt-2 w-full">
                    <thead>
                      <tr>
                        <th>Nro.</th>
                        <th>Familia</th>
                        <th>Padre</th>
                        <th>Madre</th>
                        <th>Primer Hijo/a</th>
                        <th>Segundo Hijo/a</th>
                        <th>Cancelador</th>
                        <th>Aceptación</th>
                        <th>Opciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map((inv, index) => (
                        <tr key={inv.id} className="h-14">
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">
                            {inv.family_name || ""}
                          </td>
                          <td className="text-center">
                            {inv.father_name || ""}
                          </td>
                          <td className="text-center">
                            {inv.mother_name || ""}
                          </td>
                          <td className="text-center">
                            {inv.first_child_name || ""}
                          </td>
                          <td className="text-center">
                            {inv.second_child_name || ""}
                          </td>
                          <td className="text-center">{inv.canceller || ""}</td>
                          <td className="text-center">
                            {inv.accepted ? "ACEPTADA" : "RECHAZADA"}
                          </td>
                          <td>
                            <button
                              className="flex flex-col mx-auto w-24 text-center items-center ml-auto rounded bg-red-600 py-1 px-2 text-lg text-white text-normal font-bold"
                              onClick={() => {
                                setShowDeleteModal(true);
                                setSelectedInvitation(inv);
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
      <AlertModal
        showModal={showDeleteModal}
        offModal={() => {
          setShowDeleteModal(false);
        }}
        onModal={() => setShowDeleteModal(true)}
        title="Eliminar invitación"
        description="¿Estás seguro de querer eliminar esta invitación?, este proceso es irreversible"
        disableButton={inProcess}
        onSuccess={handleDeleteInvitation}
        isWarning
        closeButton="Cancelar"
        successButton="Eliminar"
      ></AlertModal>
    </>
  );
};

export default HomePage;
