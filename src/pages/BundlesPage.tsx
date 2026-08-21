import { BundleManager } from "../components/BundleManager";
import type { ApiPanel, Bundle, BundleServiceSelections } from "../types/order";
interface BundleInput { name:string; rotations:BundleServiceSelections }
export function BundlesPage({ apis, bundles, onAddBundle, onUpdateBundle, onDeleteBundle }: { apis:ApiPanel[]; bundles:Bundle[]; onAddBundle:(bundle:BundleInput)=>void; onUpdateBundle:(id:string,bundle:BundleInput)=>void; onDeleteBundle:(id:string)=>void }) {
  return <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8"><BundleManager apis={apis} bundles={bundles} onAddBundle={onAddBundle} onUpdateBundle={onUpdateBundle} onDeleteBundle={onDeleteBundle}/></div>;
}
