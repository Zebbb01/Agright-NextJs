'use client'

import Link from 'next/link'
import { ArrowLeft, Home, Search, RefreshCw } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Animated 404 Text */}
        <div className="relative">
          <div className="text-8xl md:text-9xl font-bold text-primary/20 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <Search className="w-8 h-8 md:w-12 md:h-12 text-primary" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground">
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center space-x-4 py-6">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors duration-200 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>

        {/* Helpful Links */}
        {/* <div className="pt-8 border-t border-border">
          <h2 className="text-sm font-medium text-foreground mb-4">
            You might be looking for:
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 underline underline-offset-4"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 underline underline-offset-4"
            >
              Contact
            </Link>
            <Link
              href="/help"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 underline underline-offset-4"
            >
              Help
            </Link>
            <Link
              href="/sitemap"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 underline underline-offset-4"
            >
              Sitemap
            </Link>
          </div>
        </div> */}

        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/5 rounded-full animate-pulse"></div>
          <div className="absolute top-20 -right-8 w-32 h-32 bg-secondary/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-8 left-1/3 w-20 h-20 bg-accent/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  )
}