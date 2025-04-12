'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaYoutube, FaChartLine, FaBrain, FaRocket, FaChevronRight, FaPlay } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-6 py-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center max-w-5xl mx-auto"
          >
            <div className="rounded-full bg-red-600 p-3 mb-8">
              <FaYoutube className="w-12 h-12" />
            </div>
            
            <h1 className="text-6xl sm:text-7xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300 leading-tight">
              Unlock the <span className="text-red-500">Hidden Power</span> of Your YouTube Content
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl leading-relaxed">
              Transform ordinary videos into extraordinary results. UMater analyzes, optimizes, and elevates your content with AI-powered insights that the pros don't want you to know.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
              <Link 
                href="/video-analyzer" 
                className="flex-1 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium text-lg flex items-center justify-center gap-2 hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
              >
                Analyze Video <FaChevronRight className="w-4 h-4" />
              </Link>
              
              <Link 
                href="#how-it-works" 
                className="flex-1 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium text-lg flex items-center justify-center gap-2 hover:bg-white/15 transition-all border border-white/20"
              >
                See How It Works <FaPlay className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent"></div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Elevate Your Content Strategy</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              UMater reveals what your competition doesn't want you to see.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
            >
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                <FaChartLine className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Deep Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access comprehensive metrics that YouTube Studio doesn't show you. Uncover engagement patterns, audience retention insights, and more.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
            >
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center mb-6">
                <FaBrain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">AI-Powered Insights</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our advanced algorithms analyze transcripts, thumbnails, and engagement to provide actionable recommendations for optimization.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
            >
              <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                <FaRocket className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Growth Strategy</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Transform insights into strategic actions. Know exactly what to optimize to increase views, engagement, and subscriber growth.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Testimonials/Social Proof */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Trusted by Content Creators</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              From emerging creators to established channels with millions of subscribers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500"></div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2.3M Subscribers</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic">
                "UMater completely transformed how I approach my content strategy. I saw a 43% increase in views and doubled my subscriber growth rate in just 3 months."
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500"></div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Mark Reynolds</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tech Insights (5.7M Subscribers)</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic">
                "The keyword insights alone are worth 10x the price. UMater revealed strategic opportunities my team completely missed. It's now an essential part of our workflow."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-red-600 to-red-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Unlock Your Channel's Potential?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of creators who are using UMater to gain the competitive edge and accelerate their growth.
          </p>
          
          <Link 
            href="/video-analyzer" 
            className="px-8 py-4 bg-white text-red-600 rounded-xl font-medium text-lg inline-flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-lg"
          >
            Start Analyzing Now <FaChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
