import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Title */}
      <Skeleton className="h-10 w-64 mb-6" />

      {/* Tabs Desktop */}
      <div className="hidden sm:flex border-b border-gray-200 mb-6 space-x-8">
        <div className="pb-4 px-1 border-b-2 border-transparent">
           <Skeleton className="h-5 w-32" />
        </div>
        <div className="pb-4 px-1 border-b-2 border-transparent">
           <Skeleton className="h-5 w-48" />
        </div>
        <div className="pb-4 px-1 border-b-2 border-transparent">
           <Skeleton className="h-5 w-32" />
        </div>
      </div>
      
      {/* Tabs Mobile */}
      <div className="sm:hidden mb-6">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Content - List of Cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
               <div className="space-y-3 w-full max-w-lg">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-7 w-48" />
                  <div className="flex gap-4">
                      <Skeleton className="h-4 w-40" />
                  </div>
               </div>
               <div className="flex gap-3 mt-4 md:mt-0">
                  <Skeleton className="h-10 w-28 rounded-lg" />
                  <Skeleton className="h-10 w-28 rounded-lg" />
                  <Skeleton className="h-10 w-28 rounded-lg" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
