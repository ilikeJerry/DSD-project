import { ClientDemoSimulation } from "./components/ClientDemoSimulation";
import { dsdSpace } from "../lib/clinicalSurfaceTokens";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main
      className="dsd-page-shell"
      style={{ maxWidth: 1180, margin: "0 auto", paddingTop: dsdSpace.xl, paddingBottom: dsdSpace.xl }}
    >
      <ClientDemoSimulation />
    </main>
  );
}
