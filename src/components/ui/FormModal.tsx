import {
  TERipple,
  TEModal,
  TEModalDialog,
  TEModalContent,
  TEModalHeader,
  TEModalBody,
  TEModalFooter,
} from "tw-elements-react";
import LoadingIcon from "./LoadingIcon";

interface FormModalProps {
  onModal: () => void;
  offModal: () => void;
  showModal: boolean;
  isWarning?: boolean;
  title: string;
  children: React.ReactNode;
  description?: string;
  closeButton?: string;
  successButton?: string;
  onSuccess: () => void;
  inProcess: boolean;
  hasValidValues: boolean;
}

export default function FormModal({
  offModal,
  title,
  showModal,
  onModal,
  isWarning = false,
  children,
  closeButton = "",
  successButton = "",
  onSuccess,
  inProcess,
  hasValidValues,
}: FormModalProps): JSX.Element {
  return (
    <div>
      {/* <!-- Modal --> */}
      <TEModal show={showModal} setShow={() => onModal()} staticBackdrop>
        <TEModalDialog>
          <TEModalContent>
            <TEModalHeader>
              <h5 className="text-xl font-medium leading-normal text-neutral-800 dark:text-neutral-200">
                {title}
              </h5>

              <button
                type="button"
                className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
                onClick={() => offModal()}
                disabled={inProcess}
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </TEModalHeader>
            {/* <!--Modal body--> */}
            <TEModalBody>{children}</TEModalBody>
            <TEModalFooter>
              <TERipple rippleColor="light">
                <button
                  type="button"
                  disabled={inProcess}
                  className="inline-block rounded bg-primary-100 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-primary-700 transition duration-150 ease-in-out hover:bg-primary-accent-100 focus:bg-primary-accent-100 focus:outline-none focus:ring-0 active:bg-primary-accent-200 disabled:bg-primary-100"
                  onClick={() => offModal()}
                >
                  {closeButton}
                </button>
              </TERipple>
              <TERipple rippleColor="light">
                <button
                  type="button"
                  disabled={!hasValidValues || inProcess}
                  className={`ml-1 inline-block rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]   focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]
                  ${
                    isWarning
                      ? "bg-red-600 hover:bg-red-700 focus:bg-red-700 disabled:bg-red-400 active:bg-red-800"
                      : " bg-primary hover:bg-primary-600 focus:bg-primary-600 disabled:bg-primary-400 active:bg-primary-700"
                  }`}
                  style={{
                    boxShadow: "none",
                  }}
                  onClick={() => onSuccess()}
                >
                  {successButton}
                  {inProcess ? (
                    <LoadingIcon className="ml-2"></LoadingIcon>
                  ) : null}
                </button>
              </TERipple>
            </TEModalFooter>
          </TEModalContent>
        </TEModalDialog>
      </TEModal>
    </div>
  );
}
