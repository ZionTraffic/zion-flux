import LoaderOne from "@/components/ui/loader-one";

export function LoaderDemo() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h3 className="text-lg font-semibold">Animated Loader</h3>
      <LoaderOne />
    </div>
  );
}
