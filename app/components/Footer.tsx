'use client';

import { FaYoutube, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600">
              <span className="sr-only">YouTube</span>
              <FaYoutube className="h-6 w-6" />
            </a>
            
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <FaGithub className="h-6 w-6" />
            </a>
          </div>
          
          <div className="mt-8 md:mt-0">
            <p className="text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} UMater Analytics. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 