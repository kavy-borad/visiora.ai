
export default function Loading() {
    return (
        <div className="w-full min-h-screen pt-16 pb-12 px-4 bg-white dark:bg-slate-950 flex flex-col items-center justify-center">
            <div className="w-full max-w-6xl mx-auto space-y-12 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-6 w-24 bg-slate-200 dark:bg-gray-800 rounded-full" />
                    <div className="h-10 w-2/3 md:w-1/2 bg-slate-100 dark:bg-gray-800 rounded-xl" />
                    <div className="h-4 w-full max-w-md bg-slate-50 dark:bg-gray-900 rounded" />
                </div>

                {/* Split Content Skeleton */}
                <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center mt-12">
                    {/* Text Side */}
                    <div className="w-full md:w-1/2 space-y-8">
                        <div className="h-6 w-20 bg-slate-200 dark:bg-gray-800 rounded-full" />
                        <div className="space-y-3">
                            <div className="h-8 w-3/4 bg-slate-100 dark:bg-gray-800 rounded-lg" />
                            <div className="h-8 w-1/2 bg-slate-100 dark:bg-gray-800 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-slate-50 dark:bg-gray-900 rounded" />
                            <div className="h-4 w-11/12 bg-slate-50 dark:bg-gray-900 rounded" />
                        </div>
                        <div className="h-12 w-40 bg-slate-200 dark:bg-gray-800 rounded-2xl mt-6" />
                    </div>

                    {/* Image Side */}
                    <div className="w-full md:w-1/2">
                        <div className="aspect-[3/4] w-full bg-slate-100 dark:bg-gray-800 rounded-3xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
