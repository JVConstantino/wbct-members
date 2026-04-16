export default function StatsCard({ label, value, icon, color = "primary" }) {
    const colorClasses = {
        primary: "bg-primary-50 text-primary-600",
        green: "bg-green-50 text-green-600",
        orange: "bg-orange-50 text-orange-600",
        purple: "bg-purple-50 text-purple-600",
    }[color];

    return (
        <div className="card flex items-center gap-4">
            <div className={`p-4 rounded-xl text-2xl ${colorClasses}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
}
