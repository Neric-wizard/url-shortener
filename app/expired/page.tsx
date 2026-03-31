import { Calendar, XCircle } from "lucide-react";
import Link from "next/link";

export default function ExpiredPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
        <XCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Link Expired</h1>
        <p className="text-gray-400 mb-6">
          This short link has expired and is no longer available.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Calendar size={18} />
          Create a new link
        </Link>
      </div>
    </div>
  );
}