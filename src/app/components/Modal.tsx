import ReactDOM from "react-dom";
import { useEffect, type ReactNode } from "react";

export default function Modal({
  children,
  isOpen = false,
  setOpen,
}: {
  children: ReactNode;
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const modalRoot = document.getElementById("dashboard") as HTMLElement;

  const close = () => {
    setOpen(false);
  };

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  return ReactDOM.createPortal(
    isOpen ? (
      <div className=" animate-fadeIn bg-black  bg-opacity-40 fixed top-0 left-0 w-full h-full flex justify-center pt-[100px]">
        <div
          onClick={close}
          className="absolute left-0 top-0 z-10 w-full h-full"
        />
        <div className="transition-all relative md:min-w-[500px] z-20 animate-fadeInTranslate self-start py-5 px-6 bg-white rounded">
          <button onClick={close} className="absolute right-4 top-4">
            Close
          </button>
          {children}
        </div>
      </div>
    ) : null,
    modalRoot
  );
}
