"use client";
import { BookOpen } from "lucide-react";

export default function Header({ testName }) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{testName}</h1>
            <p className="text-sm text-gray-500">TOEIC Practice Test</p>
          </div>
        </div>
      </div>
    </header>
  );
}