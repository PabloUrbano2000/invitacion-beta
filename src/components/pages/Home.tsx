import { useState, useEffect, useContext } from "react";
import { FirebaseContext } from "../../firebase";
import { generateLastPath } from "../../utils/session";
import { Invitation } from "../../types";
import Spinner from "../ui/Spinner";
import { showFailToast } from "../../utils/toast";

const HomePage = () => {
  const { firebase } = useContext(FirebaseContext);

  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateLastPath();

    try {
      setIsLoading(true);

      firebase?.getDocumentsRealtime("invitations", (data: any) => {
        setInvitations(data);
        setIsLoading(false);
      });
    } catch (error) {
      showFailToast("Ocurrió un error al cargar las invitaciones");
    }
  }, []);

  return (
    <>
      <div className="flex flex-col container py-12 px-4 mx-auto">
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
                <table className="table-auto bg-white">
                  <thead>
                    <tr>
                      <th>Nro.</th>
                      <th>Familia</th>
                      <th>Padre</th>
                      <th>Madre</th>
                      <th>Primer Hijo/a</th>
                      <th>Segundo Hijo/a</th>
                      <th>Opciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((inv, index) => (
                      <tr key={inv.id} className="h-14">
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">{inv.family_name}</td>
                        <td className="text-center">{inv.father_name}</td>
                        <td className="text-center">{inv.mother_name}</td>
                        <td className="text-center">{inv.first_child_name}</td>
                        <td className="text-center">{inv.second_child_name}</td>
                        <td>
                          <button
                            className="flex mx-auto w-auto text-center ml-auto rounded bg-orange-400 py-1 px-2 text-lg text-white text-normal font-bold"
                            // onClick={() => handleServeReception(rec.id || "")}
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;
