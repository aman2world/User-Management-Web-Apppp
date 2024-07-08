import React from 'react'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <header className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-16">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Our Platform
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Discover the best way to manage your profile and explore new opportunities.
          </p>
        </div>
      </header>
    </div>
  )
}
