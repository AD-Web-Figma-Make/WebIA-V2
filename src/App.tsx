import { useEffect, useState } from "react";
import ConceptB from "./brisa/ConceptB";
import StatesLibrary from "./brisa/StatesLibrary";

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  const [notice, setNotice] = useState(false);
  useEffect(() => {
    const h = () => setHash(window.location.hash);
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  if (hash === "#/estados") return <StatesLibrary />;
  return (
    <>
      <ConceptB backLabel="Volver a la web" onBackToWeb={() => { setNotice(true); setTimeout(() => setNotice(false), 3500); }} />
      {notice && (
        <div role="status" className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-pine-900 px-4 py-3 text-sm text-white shadow-xl">
          Aquí se volvería a la web convencional (destino configurable).
        </div>
      )}
    </>
  );
}
