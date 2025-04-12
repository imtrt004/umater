'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaYoutube, FaChartBar, FaFire, FaKeyboard, FaFileAlt, FaChartLine } from 'react-icons/fa';

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-red-600 hover:text-red-500">
              <FaYoutube className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                UMater <span className="text-red-600">Analytics</span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/video-analyzer"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                ${pathname === '/video-analyzer' 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <FaChartBar className="mr-1.5 h-5 w-5 text-red-500" />
              <span>Video Analyzer</span>
            </Link>
            
            <Link 
              href="/trending"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                ${pathname === '/trending' 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <FaFire className="mr-1.5 h-5 w-5 text-orange-500" />
              <span>Trending</span>
            </Link>
            
            <Link 
              href="/keywords"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                ${pathname === '/keywords' || pathname.startsWith('/keywords/') 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <FaKeyboard className="mr-1.5 h-5 w-5 text-blue-500" />
              <span>Keywords</span>
            </Link>
            
            <Link 
              href="/retention"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                ${pathname === '/retention' 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <FaChartLine className="mr-1.5 h-5 w-5 text-green-500" />
              <span>Retention</span>
              <span className="ml-1 bg-red-600 text-xs px-1.5 py-0.5 rounded-full text-white">New</span>
            </Link>
            
            <Link 
              href="/transcribe"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                ${pathname === '/transcribe' 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <FaFileAlt className="mr-1.5 h-5 w-5 text-purple-500" />
              <span>Transcribe</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 