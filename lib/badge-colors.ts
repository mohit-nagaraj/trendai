export function platformBadge(platform: string) {
    if (platform === "instagram") {
        return "border-pink-500 text-pink-600";
    }
    if (platform === "tiktok") {
        return "border-black text-black";
    }
    if (platform === "linkedin") {
        return "border-blue-600 text-blue-700";
    }
    if (platform === "youtube") {
        return "border-red-600 text-red-700";
    }
    if (platform === "twitter" || platform === "twitter/x" || platform === "x") {
        return "border-sky-400 text-sky-700";
    }
    return "border-gray-300 text-gray-600";
}


export function statusColor(status: string) {
    switch (status) {
        case "pending": return "bg-yellow-200 text-yellow-800";
        case "processing": return "bg-blue-200 text-blue-800";
        case "completed": return "bg-green-200 text-green-800";
        case "failed": return "bg-red-200 text-red-800";
        default: return "bg-gray-200 text-gray-800";
    }
}